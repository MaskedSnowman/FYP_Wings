from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import render
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import get_user_model, login, logout
from rest_framework import viewsets, permissions, status, generics
from .serializers import *
from rest_framework.response import Response
from rest_framework.views import APIView
from .validations import *
from django.views.decorators.csrf import csrf_protect
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework.permissions import AllowAny, IsAuthenticated
import requests
from duffel_api import Duffel
from amadeus import Client, ResponseError
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
# from .validations import custom_validation, validate_email, validate_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.core.exceptions import ObjectDoesNotExist 
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from django.core.mail import EmailMultiAlternatives
import os
from django.db.models import Sum
from collections import defaultdict

# class UserRegister(APIView):
#     permission_classes = (permissions.AllowAny,)

#     def post(self, request):
#         clean_data = custom_validation(request.data)
#         serializer = UserRegisterSerializer(data=clean_data)
#         if serializer.is_valid(raise_exception=True):
#             user = serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class UserLogin(APIView):
#     permission_classes = (permissions.AllowAny,)
#     authentication_classes = (SessionAuthentication, BasicAuthentication)

#     def post(self, request):
#         data = request.data
#         assert validate_email(data)
#         assert validate_password(data)
#         serializer = UserLoginSerializer(data=data)
#         if serializer.is_valid(raise_exception=True):
#             user = serializer.check_user(data)
#             login(request, user)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class UserLogout(APIView):
#     permission_classes = (permissions.AllowAny,)
#     authentication_classes = ()

#     def post(self, request):
#         logout(request)
#         return Response(status=status.HTTP_200_OK)

# class UserView(APIView):
#     permission_classes = (permissions.IsAuthenticated,)
#     authentication_classes = (SessionAuthentication, BasicAuthentication)

#     def get(self, request):
#         serializer = UserSerializer(request.user)
#         return Response({'user': serializer.data}, status=status.HTTP_200_OK)
                



    
def get_aircraft(request):
    duffel = Duffel(access_token='duffel_test_bl6lsCRkoKbnG3GGptTbNRkW92M2QTZDWsU_oGp_QqL')
    origin = request.GET.get('origin', 'JED')  
    destination = request.GET.get('destination', 'KUL')  
    departure_date = request.GET.get('departure_date', '2024-12-01')

    # List of Asian country IATA codes
    asian_airports_iata = [
        "PEK", "HND", "DXB", "HKG", "BKK", "NRT", "SIN", "ICN", "KUL", "CGK",
        "KIX", "PVG", "CAN", "DEL", "BOM", "SYD", "MNL", "SIN", "KIX", "SGN",
        "DME", "SVO", "LED", "VVO", "BWN", "PNH", "DAD", "HAN", "CXR", "SIN",
        "KUL", "RGN", "CEB", "OKA", "CTS", "ICN", "PUS", "HKT", "CNX", "DMK",
        "TPE", "KHH", "DPS", "SUB", "AUH", "RUH", "DOH", "KWI", "BAH", "MLE",
        "CMB", "TAS", "ALA", "TSE", "GYD", "EVN", "NQZ", "FRU", "DMM", "JED"
        ]
    def is_asian_country(iata_code):
        return iata_code[:3] in asian_airports_iata  

    if not (is_asian_country(origin) and is_asian_country(destination)):
        return JsonResponse({"error": "Both origin and destination must be in Asia."}, status=400)

    passengers = [{"type": "adult"}]
    slices = [{"origin": origin, "destination": destination, "departure_date": departure_date}]
    
    offer_request_client = duffel.offer_requests.create()
    offer_request_client.cabin_class("economy")
    offer_request_client.passengers(passengers)
    offer_request_client.slices(slices)
    offer_request_client.max_connections(1)
    offer_request_client.return_offers()
    
    response = offer_request_client.execute()
    
    def airport_to_dict(airport):
        return {
            "iata_code": getattr(airport, 'iata_code', None),
            "name": getattr(airport, 'name', None),
            "city_name": getattr(airport, 'city_name', None),
            "latitude": getattr(airport, 'latitude', None),
            "longitude": getattr(airport, 'longitude', None),
            "time_zone": getattr(airport, 'time_zone', None)
        }
        
    def airline_info(airline):
        return {
            "conditions_of_carriage_url": getattr(airline, 'conditions_of_carriage_url', None),
            "iata_code": getattr(airline, 'iata_code', None),
            "id": getattr(airline, 'id', None),
            "logo_lockup_url": getattr(airline, 'logo_lockup_url', None),
            "logo_symbol_url": getattr(airline, 'logo_symbol_url', None),
            "name": getattr(airline, 'name', None)
        }

    def extract_slice_data(slice):
        return {
            "origin": airport_to_dict(slice.origin),
            "destination": airport_to_dict(slice.destination),
            "killme": [extract_segment_data(segment) for segment in slice.segments],
            "departure_date": slice.departure_date,
            "origin_type": slice.origin_type
        } if hasattr(slice, 'segments') else {
            "origin": airport_to_dict(slice.origin),
            "destination": airport_to_dict(slice.destination),
            "departure_date": slice.departure_date
        }
         
    def extract_offer_data(offer):
        return {
            "id": offer.id,
            "total_amount": offer.total_amount,
            "total_currency": offer.total_currency,
            "available_services": offer.available_services,
            "owner": airline_info(offer.owner),
            "base_amount": offer.base_amount,
            "tax_amount": offer.tax_amount,
            "base_currency": offer.base_currency,
            "total_emissions_kg": offer.total_emissions_kg,
            "offerslices": [extract_offer_slice(slice) for slice in offer.slices],
        }

    def extract_offer_slice(slice):
        return {
            # "origin": airport_to_dict(slice.origin),
            # "destination": airport_to_dict(slice.destination),
            "segment": [extract_segment_data(segment) for segment in slice.segments],
            "duration": slice.duration
        } if hasattr(slice, 'segments') else {
            # "failure": airport_to_dict(slice.origin),
            # "destination": airport_to_dict(slice.destination),
            # "duration": slice.duration
        }

    def extract_segment_data(segment):
        return {
            "id": segment.id,
            "origin": airport_to_dict(segment.origin),
            "destination": airport_to_dict(segment.destination),
            # "operating_carrier": segment.operating_carrier,
            # "marketing_carrier": segment.marketing_carrier,
            "marketing_carrier_flight_number": segment.marketing_carrier_flight_number,
            # "aircraft": segment.aircraft,
            "duration": segment.duration,
            "distance": segment.distance,
            "stops": extract_stops_data(segment.stops),
            "departing_at": segment.departing_at,
            "arriving_at": segment.arriving_at
        }
            
    def extract_stops_data(stop):
        return{
            "id": getattr(stop, 'id', None),
            "duration": getattr(stop, 'duration', None)
            # "departing_at": getattr(stop, 'departing_at', None),


            # "id": stop.id,
            # "departing_at":stop.departing_at,
            # "arriving_at":stop.arriving_at
        }
    
    offer_request_data = {
        "id": response.id,
        "cabin_class": response.cabin_class,
        "created_at": response.created_at,
        "live_mode": response.live_mode,
        "slices": [extract_slice_data(slice) for slice in response.slices],
        "offers": [extract_offer_data(offer) for offer in response.offers],
    }
        
    return JsonResponse(offer_request_data, safe=False)

# def SkyscannerHotelSearch(request):
    
#         url = "https://booking-com15.p.rapidapi.com/api/v1/meta/locationToLatLong"

#         querystring = {"query":"kuala"}
#         # url = "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotelsByCoordinates"
#         # querystring = {"arrival_date":"2024-11-17", "departure_date":"2024-11-18","latitude":"19.24232736426361","longitude":"72.85841985686734","adults":"1","children_age":"0,17","room_qty":"1","units":"metric","temperature_unit":"c","languagecode":"en-us","currency_code":"EUR"}
#         # querystring = {"arrival_date":"2024-11-17", "departure_date":"2024-11-18","hotel_id":"191605","adults":"1","children_age":"1,17","room_qty":"1","units":"metric","temperature_unit":"c","languagecode":"en-us","currency_code":"EUR"}
#         headers = {
#         "x-rapidapi-key": "50efc8a679mshd6e0b309ce18c1cp1d72abjsn9f3ba584030d", 
#         "x-rapidapi-host": "booking-com15.p.rapidapi.com"
#         }

#         response = requests.get(url, headers=headers, params=querystring)
#         if response.status_code == 200:
#             return JsonResponse(response.json(), safe=False, status=response.status_code)
#         else:
#             return JsonResponse({"error": response.json()}, status=response.status_code)


def SkyscannerHotelSearch(request):
    location_name = request.GET.get('location', 'kuala')
    check_in_date = request.GET.get('check_in', '2024-11-17')
    check_out_date = request.GET.get('check_out', '2024-11-18')
    adults = request.GET.get('adults', '1')
    children_age = request.GET.get('children_age', '0,17')
    room_qty = request.GET.get('room_qty', '1')
    currency_code = request.GET.get('currency_code', 'EUR')
    
    url_lat_long = "https://booking-com15.p.rapidapi.com/api/v1/meta/locationToLatLong"
    querystring_lat_long = {"query": location_name}
    headers = {
        'x-rapidapi-key': "f5cb0387f1msh632789447cc8d16p1968d8jsnd1fbf2bd2707",
        'x-rapidapi-host': "booking-com15.p.rapidapi.com"
    }

    response_lat_long = requests.get(url_lat_long, headers=headers, params=querystring_lat_long)
    if response_lat_long.status_code != 200:
        return JsonResponse({"error": response_lat_long.json()}, status=response_lat_long.status_code)
    
    lat_long_data = response_lat_long.json()
    if not lat_long_data['status']:
        return JsonResponse({"error": "Location not found"}, status=404)
    
    lat = lat_long_data['data'][0]['geometry']['location']['lat']
    lng = lat_long_data['data'][0]['geometry']['location']['lng']
    
    url_hotels = "https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotelsByCoordinates"
    querystring_hotels = {
        "arrival_date": check_in_date,
        "departure_date": check_out_date,
        "latitude": lat,
        "longitude": lng,
        "adults": adults,
        "children_age": children_age,
        "room_qty": room_qty,
        "units": "metric",
        "temperature_unit": "c",
        "languagecode": "en-us",
        "currency_code": currency_code
    }

    response_hotels = requests.get(url_hotels, headers=headers, params=querystring_hotels)
    if response_hotels.status_code != 200:
        return JsonResponse({"error": response_hotels.json()}, status=response_hotels.status_code)
    
    hotels_data = response_hotels.json()
    hotel_details_list = []

    url_details = "https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelDetails"
    
    for hotel in hotels_data['data']:
        hotel_id = hotel['id']
        querystring_details = {"hotel_id": hotel_id}
        
        response_details = requests.get(url_details, headers=headers, params=querystring_details)
        if response_details.status_code == 200:
            details_data = response_details.json()
            hotel_details = {
                "url": details_data.get('url'),
                "accommodation_type_name": details_data.get('accommodation_type_name'),
                "arrival_date":details_data.get('arrival_date'),
                "departure_date":details_data.get('departure_date'),
            }
            hotel_details_list.append(hotel_details)
        else:
            hotel_details_list.append({"error": "Details not found for hotel ID: {}".format(hotel_id)})

    return JsonResponse(hotel_details_list, safe=False, status=200)

User = get_user_model()

class UserLogin(TokenObtainPairView):
    serializer_class = UserToken

class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegister

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def protectedView(request):
    output = f"Welcome {request.user}, Authentication Successful"
    return Response({'response':output}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def profileInfo(request):
    user = request.user
    serializer = UserWithBookingSerializer(user)
    return Response(serializer.data)

# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# @authentication_classes([JWTAuthentication])
# class UserProfileUpdate(APIView):
#     permission_classes = [IsAuthenticated]

#     def put(self, request, *args, **kwargs):
#         user = request.user
#         serializer = UserSerializer(user, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=400)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def UserProfileUpdate(request):
    new_firstName = request.data.get('firstName', '')
    new_lastName = request.data.get('lastName', '')
    new_email = request.data.get('email', '')
    new_phone = request.data.get('phone', '')
    new_password = request.data.get('password', '')

    try:
        profile = request.user
    except ObjectDoesNotExist:
        return Response({'message': 'Profile not found'}, status=404)
        
    profile.firstName = new_firstName
    profile.lastName = new_lastName      
    profile.phone = new_phone      
    profile.email = new_email      
    profile.password = new_password      

    profile.save()

    return Response({'message': 'Data updated successfully'})



# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# @authentication_classes([JWTAuthentication])
# def createBooking(request):
#     user = request.user
#     data = request.data
#     booking = Booking(
#         user=user,
#         duffel_booking_id=data['id'],
#         origin=data['origin'],
#         destination=data['destination'],
#         departure_date=data['departure_date'],
#         return_date=data.get('return_date'),
#         total_amount=data['total_amount'],
#         currency=data['currency']
#     )
#     booking.save()
#     serializer = BookingSerializer(booking)
#     return Response(serializer.data, status=status.HTTP_201_CREATED)

# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# @authentication_classes([JWTAuthentication])
# def delete_booking(request, booking_id):
#     try:
#         booking = Booking.objects.get(id=booking_id, user=request.user)
#         booking.delete()
#         return Response({'message': 'Booking deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
#     except Booking.DoesNotExist:
#         return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    



















@permission_classes([AllowAny])
def getDetailsByID(request):
    try:
        duffel = Duffel(access_token='duffel_test_bl6lsCRkoKbnG3GGptTbNRkW92M2QTZDWsU_oGp_QqL')
        id = request.GET.get('id', 'off_0000AjUXwSWpvUpH5SIxrD')  

        response = duffel.offers.get(id)

        if not response:
            return JsonResponse({'error': f'Failed to fetch data from Duffel API. Status code: {response.status_code}'})

        def airport_to_dict(airport):
            return {
                "iata_code": getattr(airport, 'iata_code', None),
                "name": getattr(airport, 'name', None),
                "city_name": getattr(airport, 'city_name', None),
                "latitude": getattr(airport, 'latitude', None),
                "longitude": getattr(airport, 'longitude', None),
                "time_zone": getattr(airport, 'time_zone', None)
            }
            
        def airline_info(airline):
            return {
                "conditions_of_carriage_url": getattr(airline, 'conditions_of_carriage_url', None),
                "iata_code": getattr(airline, 'iata_code', None),
                "id": getattr(airline, 'id', None),
                "logo_lockup_url": getattr(airline, 'logo_lockup_url', None),
                "logo_symbol_url": getattr(airline, 'logo_symbol_url', None),
                "name": getattr(airline, 'name', None)
            }

        def extract_offer_slice(slice):
            return {
                # "origin": airport_to_dict(slice.origin),
                # "destination": airport_to_dict(slice.destination),
                "segment": [extract_segment_data(segment) for segment in slice.segments],
                "duration": slice.duration
            } if hasattr(slice, 'segments') else {
                # "failure": airport_to_dict(slice.origin),
                # "destination": airport_to_dict(slice.destination),
                # "duration": slice.duration
            }

        def extract_segment_data(segment):
            return {
                "id": segment.id,
                "origin": airport_to_dict(segment.origin),
                "destination": airport_to_dict(segment.destination),
                # "operating_carrier": segment.operating_carrier,
                # "marketing_carrier": segment.marketing_carrier,
                "marketing_carrier_flight_number": segment.marketing_carrier_flight_number,
                # "aircraft": segment.aircraft,
                "duration": segment.duration,
                "distance": segment.distance,
                "stops": extract_stops_data(segment.stops),
                "departing_at": segment.departing_at,
                "arriving_at": segment.arriving_at
            }
                
        def extract_stops_data(stop):
            return{
                "id": getattr(stop, 'id', None),
                "duration": getattr(stop, 'duration', None)
                # "departing_at": getattr(stop, 'departing_at', None),
                # "id": stop.id,
                # "departing_at":stop.departing_at,
                # "arriving_at":stop.arriving_at
            }
        
        def extract_available_services(service):
            return {
                # "type": service.type,
                # "total_currency": service.total_currency,
                # "total_amount": service.total_amount,
            }
        
        extract_offer_data = {
                "id": response.id,
                "total_amount": response.total_amount,
                "total_currency": response.total_currency,
                "available_services": extract_available_services(response.available_services),
                "owner": airline_info(response.owner),
                "base_amount": response.base_amount,
                "tax_amount": response.tax_amount,
                "base_currency": response.base_currency,
                "total_emissions_kg": response.total_emissions_kg,
                "offerslices": [extract_offer_slice(slice) for slice in response.slices],
            }
 
        return JsonResponse(extract_offer_data, safe=False)

    except Exception as e:
        return JsonResponse({'error': f'Failed to process request: {str(e)}'})

# @csrf_exempt
# @api_view(['POST'])
# def makebooking(request):
#     if request.method == 'POST':
#         try:
#             # Create a new Booking instance
#             booking = Booking.objects.create(
#                 passenger_name=request.data.get('passenger_name'),
#                 card=request.data.get('card'),
#                 email=request.data.get('email'),
#                 flightname=request.data.get('flightname'),
#                 logo=request.data.get('logo'),
#                 flightnumber=request.data.get('flightnumber'),
#                 departure_time=request.data.get('departure_time'),
#                 arrival_time=request.data.get('arrival_time'),
#                 origin=request.data.get('origin'),
#                 destination=request.data.get('destination'),
#                 currency=request.data.get('currency'),
#                 base_amount=request.data.get('base_amount'),
#                 tax_amount=request.data.get('tax_amount'),
#                 total_amount=request.data.get('total_amount'),
#             )
            
#             return JsonResponse({'message': 'Booking created successfully'})
        
#         except Exception as e:
#             return JsonResponse({'error': str(e)}, status=500)  # Handle any other exceptions
    
#     else:
#         # Handle GET requests or other methods if necessary
#         return JsonResponse({'error': 'Only POST method is allowed'}, status=405)


@csrf_exempt
@api_view(['POST'])
def makeflightbooking(request):
    if request.method == 'POST':
        # Assuming data is sent as JSON
        data = request.data
        
        # Create a new Booking instance
        booking = Booking.objects.create(
            user=request.user if request.user.is_authenticated else None,
            passenger_name=data.get('passenger_name'),
            card=data.get('card'),
            email=data.get('email'),
            flightname=data.get('flightname'),
            logo=data.get('logo'),
            flightnumber=data.get('flightnumber'),
            departure_time=data.get('departure_time'),
            arrival_time=data.get('arrival_time'),
            origin=data.get('origin'),
            destination=data.get('destination'),
            currency=data.get('currency'),
            base_amount=data.get('base_amount'),
            tax_amount=data.get('tax_amount'),
            total_amount=data.get('total_amount'),
        )

        user = request.user  # Assuming you have authentication set up and user is available in request
        if user:
            if user.bookingID:  # Check if recipes field is not empty
                bookingIDs = user.bookingID.split(',')  # Split existing recipe IDs
            else:
                bookingIDs = []
            bookingIDs.append(str(booking.id))  # Append new recipe ID as string
            user.bookingID = ','.join(bookingIDs)  # Join back into a comma-separated string
            user.save()  # Save the profile to persist the changes


        send_booking_confirmation_email(booking)
        
        return Response({'status': 'accepted'})  # Return a clear response
        
    return Response({'status': 'rejected'})  # Handle method not allowed

def send_booking_confirmation_email(booking):
    subject = 'Booking Confirmation'
    context = {
        'booking_id': booking.id,
        'passenger_name': booking.passenger_name,
        'flightname': booking.flightname,
        'departure_time': booking.departure_time,
        'arrival_time': booking.arrival_time,
        'origin': booking.origin,
        'destination': booking.destination,
        'total_amount': booking.total_amount,
        'currency': booking.currency,
    }

    # Render email body from a template
    html_message = render_to_string('booking_confirmation.html', context)
    plain_message = strip_tags(html_message)

    pdf_file = generate_booking_pdf(booking)

    # Send email using Django's send_mail function
    email = EmailMultiAlternatives(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [booking.email],
    )
    
    # Attach PDF file to email
    with open(pdf_file, 'rb') as f:
        email.attach(filename=os.path.basename(pdf_file), content=f.read(), mimetype='application/pdf')

    # Attach HTML content as alternative content
    email.attach_alternative(html_message, "text/html")

    # Send email
    email.send()

    os.remove(pdf_file)

def generate_booking_pdf(booking):
    filename = f'booking_{booking.id}.pdf'
    document_title = f'Booking Details - {booking.id}'

    # Create a canvas
    c = canvas.Canvas(filename, pagesize=letter)
    c.setTitle(document_title)

    # Write booking details to the PDF
    c.drawString(100, 750, f'Booking ID: {booking.id}')
    c.drawString(100, 730, f'Passenger Name: {booking.passenger_name}')
    c.drawString(100, 710, f'Flight Name: {booking.flightname}')
    # Add more details as needed

    c.save()

    return filename

@api_view(['GET'])
def get_booking_details(request):
    id = request.GET.get('id', '45')  

    try:
        booking = Booking.objects.get(id=id)
        # You can serialize the booking data if needed
        booking_data = {
            'id': booking.id,
            'user': booking.user.email,
            'passenger_name': booking.passenger_name,
            'card': booking.card,
            'email': booking.email,
            'flightname': booking.flightname,
            'logo': booking.logo,
            'flightnumber': booking.flightnumber,
            'departure_time': booking.departure_time,
            'arrival_time': booking.arrival_time,
            'origin': booking.origin,
            'destination': booking.destination,
            'currency': booking.currency,
            'base_amount': str(booking.base_amount),
            'tax_amount': str(booking.tax_amount),
            'total_amount': str(booking.total_amount),
            'created_at': booking.created_at,
            'updated_at': booking.updated_at,
        }
        return Response(booking_data, status=status.HTTP_200_OK)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def hotel_detail(request, id):
    try:
        hotel = Hotel.objects.get(id=id)
        serializer = HotelSerializer(hotel)
        return Response(serializer.data)
    except Hotel.DoesNotExist:
        return Response(status=404)

@api_view(['GET'])
def recommend_hotels(request, city):
    hotels = Hotel.objects.filter(location_city=city).exclude(id=request.query_params.get('exclude_id'))
    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


@csrf_exempt
@api_view(['POST'])
def makehotelbooking(request):
    if request.method == 'POST':
        # Assuming data is sent as JSON
        data = request.data
        
        # Create a new Booking instance
        hotelbooking = HotelBooking.objects.create(
            user=request.user if request.user.is_authenticated else None,
            hotel_id=data.get('hotel_id'),
            hotel_name=data.get('hotel_name'),
            name=data.get('name'),
            card_number=data.get('card_number'),
            email=data.get('email'),
            check_in_date=data.get('check_in_date'),
            check_out_date=data.get('check_out_date'),
            room_type=data.get('room_type'),
            number_of_rooms=data.get('number_of_rooms'),
            total_price=data.get('total_price'),
        )

        user = request.user
        if user:
            if user.hotelbookingID: 
                bookingIDs = user.hotelbookingID.split(',')  
            else:
                bookingIDs = []
            bookingIDs.append(str(hotelbooking.id))  
            user.hotelbookingID = ','.join(bookingIDs)  
            user.save()  # Save the profile to persist the changes


        send_hotel_booking_confirmation_email(hotelbooking)
        
        return Response({'status': 'accepted'})  # Return a clear response
        
    return Response({'status': 'rejected'})  # Handle method not allowed

def send_hotel_booking_confirmation_email(booking):
    subject = 'Booking Confirmation'
    context = {
        'booking_id': booking.hotel_id,
        'passenger_name': booking.name,
        'hotel_name': booking.hotel_name,
        'check_in_date': booking.check_in_date,
        'check_out_date': booking.check_out_date,
        'room_type': booking.room_type,
        'number_of_rooms': booking.number_of_rooms,
        'total_price': booking.total_price,
        'currency': "USD",
    }

    # Render email body from a template
    html_message = render_to_string('hotel_booking_confirmation.html', context)
    plain_message = strip_tags(html_message)

    pdf_file = generate_hotelbooking_pdf(booking)

    # Send email using Django's send_mail function
    email = EmailMultiAlternatives(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [booking.email],
    )
    
    # Attach PDF file to email
    with open(pdf_file, 'rb') as f:
        email.attach(filename=os.path.basename(pdf_file), content=f.read(), mimetype='application/pdf')

    # Attach HTML content as alternative content
    email.attach_alternative(html_message, "text/html")

    # Send email
    email.send()

    os.remove(pdf_file)

def generate_hotelbooking_pdf(booking):
    filename = f'booking_{booking.id}.pdf'
    document_title = f'Booking Details - {booking.id}'

    # Create a canvas
    c = canvas.Canvas(filename, pagesize=letter)
    c.setTitle(document_title)

    # Write booking details to the PDF
    c.drawString(100, 750, f'Booking ID: {booking.hotel_id}')
    c.drawString(100, 730, f'Passenger Name: {booking.name}')
    c.drawString(100, 710, f'Flight Name: {booking.hotel_name}')
    # Add more details as needed

    c.save()

    return filename

def admin_report(request):
    # Query to get total number of bookings
    total_bookings = Booking.objects.count()

    # Query to get total revenue from flight bookings
    total_revenue_flight = Booking.objects.aggregate(total=Sum('total_amount')).get('total', 0.0)

    # Query to get total number of hotel bookings
    total_hotel_bookings = HotelBooking.objects.count()

    # Query to get total revenue from hotel bookings
    total_revenue_hotel = HotelBooking.objects.exclude(status='Cancelled').aggregate(total=Sum('total_price')).get('total', 0.0)

    # Query to get total number of users
    total_users = User.objects.count()

    # Query to get total number of admin users
    total_admins = User.objects.filter(is_admin=True).count()

    # Prepare data to send as JSON response
    data = {
        'total_bookings': total_bookings,
        'total_revenue_flight': total_revenue_flight,
        'total_hotel_bookings': total_hotel_bookings,
        'total_revenue_hotel': total_revenue_hotel,
        'total_users': total_users,
        'total_admins': total_admins,
    }

    # Return JSON response
    return JsonResponse(data)

class hotel_list(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request):
        hotels = Hotel.objects.all()
        hotel_counts = defaultdict(int)  
        
        for hotel in hotels:
            locations = hotel.location_city.split(', ')
            for location in locations:
                hotel_counts[location] += 1
        
        sorted_locations = sorted(hotel_counts.items(), key=lambda x: x[1], reverse=True)

        location_strings = [f"{location[0]}" for location in sorted_locations]

        return Response(location_strings, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_hotel_booking_details(request):
    id = request.GET.get('id', '2')  

    try:
        booking = HotelBooking.objects.get(id=id)
        # You can serialize the booking data if needed
        booking_data = {
            'id': booking.id,
            'hotel_name': booking.hotel_name,
            'check_in_date': booking.check_in_date,
            'check_out_date': booking.check_out_date,
            'total_price': booking.total_price,
            'booking_date': booking.booking_date,
            'status': booking.status,
        }
        return Response(booking_data, status=status.HTTP_200_OK)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def cancel_booking(request):
    booking_id = request.data.get('id')
    if not booking_id:
        return Response({'error': 'Booking ID parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        booking = HotelBooking.objects.get(id=booking_id)
        # Update the booking status to 'Request to cancel'
        booking.status = 'Request to cancel'
        booking.save()
        return Response({'message': 'Booking cancellation requested successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def hotel_bookings(request):
    try:
        hotel_bookings = HotelBooking.objects.all()
        serializer = HotelBookingSerializer(hotel_bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def cancel_requests(request):
    try:
        hotel_bookings = HotelBooking.objects.all().exclude(status='Booked').exclude(status='Cancelled')
        serializer = HotelBookingSerializer(hotel_bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def admin_cancel_booking(request):
    booking_id = request.data.get('id')
    decision = request.data.get('decision')
    if not booking_id:
        return Response({'error': 'Booking ID parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        booking = HotelBooking.objects.get(id=booking_id)
        # Update the booking status to 'Request to cancel'
        if decision == 'accept':
            booking.status = 'Cancelled'
        else:
            booking.status = 'Booked'

        booking.save()
        return Response({'message': 'Booking cancellation requested successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
