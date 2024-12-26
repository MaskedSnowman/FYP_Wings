from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser
from .manager import UserManager
from django.db.models.signals import post_save
from django.core.validators import RegexValidator

class Project_Models(models.Model):
    FlightId = models.CharField(unique=True, max_length=8, null=True)
    DepartureL = models.CharField(max_length=500) 
    ArrivalL = models.CharField(max_length=500) 
    DepartureD = models.DateField()
    ArrivalD = models.DateField()

card_number_validator = RegexValidator(regex=r'^[0-9]{13,16}$',message='Credit card number must be 13-16 digits long and contain only numeric characters.',)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    firstName = models.CharField(max_length=100 )  
    lastName = models.CharField(max_length=100)
    phone = models.CharField(max_length=14)  
    bookingID = models.TextField(default=list)
    hotelbookingID = models.TextField(null=True)
    is_verified = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=True)
    email_token = models.CharField(max_length=100, null=True, blank=True)
    forget_password = models.CharField(max_length=100, null=True, blank=True)
    last_login_time = models.DateTimeField(null=True, blank=True)
    last_logout_time = models.DateTimeField(null=True, blank=True)

    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    def booking(self):
        booking = Booking.objects.get(user=self)
    def hbooking(self):
        hbooking = HotelBooking.objects.get(user=self)

class Booking(models.Model):
    id = models.BigAutoField(auto_created=True, primary_key=True, verbose_name='ID')
    # user data
    user = models.ForeignKey(User, related_name='booking', on_delete=models.CASCADE, null=True)
    # card = models.IntegerField(max_length=16)
    passenger_name = models.CharField(max_length=255, null=True)
    card = models.CharField(max_length=16, validators=[card_number_validator], help_text='Enter your 13-16 digit credit card number.', null=True)
    email = models.EmailField(max_length=255, null=True)

    # flight data
    flightname = models.CharField(max_length=255, null=True)
    logo = models.CharField(max_length=255, null=True)    
    flightnumber = models.CharField(max_length=255, null=True)
    departure_time = models.DateTimeField(null=True)
    arrival_time = models.DateTimeField(null=True, blank=True)

    # flight details
    origin = models.CharField(max_length=255, null=True)
    destination = models.CharField(max_length=255, null=True)

    # cost details
    currency = models.CharField(max_length=10, default=0, null=True)
    base_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

class HotelBooking(models.Model):
    user = models.ForeignKey(User, related_name='hbooking', on_delete=models.CASCADE, null=True)
    hotel_id = models.IntegerField() 
    hotel_name = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    card_number = models.CharField(max_length=16)  
    email = models.EmailField()
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    room_type = models.CharField(max_length=100)
    number_of_rooms = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=100,default="Booked")

    def __str__(self):
        return f"{self.name} - {self.hotel_name}"


class Hotel(models.Model):
    id = models.AutoField(primary_key=True, unique=True)
    hotel_name = models.CharField(max_length=255,null=True)
    location_address = models.CharField(max_length=255,null=True)
    location_city = models.CharField(max_length=100,null=True)
    location_postal_code = models.CharField(max_length=20,null=True)
    location_country = models.CharField(max_length=100,null=True)
    location_latitude = models.DecimalField(max_digits=9, decimal_places=6,null=True)
    location_longitude = models.DecimalField(max_digits=9, decimal_places=6,null=True)
    rating = models.IntegerField(null=True)
    general_amenities = models.CharField(max_length=255,null=True)
    dining_amenities = models.CharField(max_length=255,null=True)
    wellness_amenities = models.CharField(max_length=255,null=True)
    service_amenities = models.CharField(max_length=255,null=True)
    room_types_name = models.CharField(max_length=255,null=True)
    room_types_description = models.TextField(null=True)
    room_types_max_occupancy = models.CharField(max_length=255,null=True)  # Storing as string, can be parsed later
    room_types_amenities = models.CharField(max_length=255,null=True)  # Storing as string, can be parsed later
    room_types_price = models.CharField(max_length=255,null=True)  # Storing as string, can be parsed later
    room_types_image_link = models.CharField(max_length=500,null=True)
    contact_info_phone = models.CharField(max_length=50,null=True)
    contact_info_email = models.EmailField(null=True)
    contact_info_website = models.URLField(null=True)
    check_in_time = models.TimeField(null=True)
    check_out_time = models.TimeField(null=True)
    nearest_airport_name = models.CharField(max_length=255,null=True)
    nearest_airport_code = models.CharField(max_length=10,null=True)
    nearest_airport_distance_km = models.IntegerField(null=True)
    nearest_attractions_name = models.CharField(max_length=255,null=True)
    nearest_attractions_distance_km = models.CharField(max_length=255,null=True)  # Storing as string, can be parsed later
    nearest_attractions_description = models.TextField(null=True)
    dining_options_name = models.CharField(max_length=255,null=True)
    dining_options_type = models.CharField(max_length=255,null=True)
    dining_options_description = models.TextField(null=True)
    spa_details_name = models.CharField(max_length=255,null=True)
    spa_details_treatments = models.CharField(max_length=255,null=True)
    spa_details_facilities = models.CharField(max_length=255,null=True)
    additional_services_wedding_services = models.BooleanField(null=True)
    additional_services_conference_facilities = models.BooleanField(null=True)
    additional_services_pet_friendly = models.BooleanField(null=True)
    images = models.TextField(null=True)  # Storing as comma-separated URLs, can be parsed later

    def __str__(self):
        return self.hotel_name

    class Meta:
        verbose_name_plural = "Hotels"


class FlightSearch(models.Model):
    origin_city = models.CharField(max_length=255)
    travel_city = models.CharField(max_length=255)
    depart_date = models.DateField()
    arrival_date = models.DateField()
    passengers = models.IntegerField()
    travel_class = models.CharField(max_length=50)

