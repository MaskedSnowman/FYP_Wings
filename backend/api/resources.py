from import_export import resources
from .models import Hotel

class HotelResource(resources.ModelResource):
    class Meta:
        model = Hotel
        import_id_fields = ['hotel_name']  # or any other unique field
        fields = ('hotel_name', 'location_address', 'location_city', 'location_postal_code', 
                  'location_country', 'location_latitude', 'location_longitude', 'rating', 
                  'general_amenities', 'dining_amenities', 'wellness_amenities', 
                  'service_amenities', 'room_types_name', 'room_types_description', 
                  'room_types_max_occupancy', 'room_types_amenities', 'room_types_price', 
                  'room_types_image_link', 'contact_info_phone', 'contact_info_email', 
                  'contact_info_website', 'check_in_time', 'check_out_time', 
                  'nearest_airport_name', 'nearest_airport_code', 'nearest_airport_distance_km', 
                  'nearest_attractions_name', 'nearest_attractions_distance_km', 
                  'nearest_attractions_description', 'dining_options_name', 'dining_options_type', 
                  'dining_options_description', 'spa_details_name', 'spa_details_treatments', 
                  'spa_details_facilities', 'additional_services_wedding_services', 
                  'additional_services_conference_facilities', 'additional_services_pet_friendly', 
                  'images')
