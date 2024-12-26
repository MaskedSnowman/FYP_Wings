from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.tokens import Token
from django.contrib.auth import get_user_model, authenticate
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
User = get_user_model()

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

    # def to_representation(self, instance):
    #     representation = super().to_representation(instance)
    #     # Convert JSONField strings back to JSON objects
    #     representation['room_types'] = instance.room_types
    #     representation['nearest_attractions'] = instance.nearest_attractions
    #     representation['dining_options'] = instance.dining_options
    #     representation['spa_treatments'] = instance.spa_treatments
    #     representation['spa_facilities'] = instance.spa_facilities
    #     representation['image_links'] = instance.image_links
    #     return representation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'password']
    def update(self, instance, validated_data):
        # If password is being updated, use set_password to hash it
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
class UserToken(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user) -> Token:
        token = super().get_token(user)

        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['email'] = user.email
        token['phone'] = user.phone
        token['is_admin'] = user.is_admin
        return token

class UserRegister(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True, required = True, validators = [validate_password])
    Confirmpassword = serializers.CharField(write_only = True, required = True)
    firstName = serializers.CharField(write_only = True, required = True)
    lastName = serializers.CharField(write_only = True, required = True)
    phone = serializers.CharField(write_only = True, required = True)

    class Meta:
        model = User
        fields = ['firstName', 'lastName', 'phone', 'email', 'password', 'Confirmpassword']

    def validate(self, attrs):
        if attrs['password'] != attrs['Confirmpassword']:
            raise serializers.ValidationError(
                {'password':"Password Fields Didn't Match"}
            )
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email'],
            firstName=validated_data['firstName'],
            lastName=validated_data['lastName'],
            phone=validated_data['phone'],
            is_admin=False
                            )
        user.set_password(validated_data['password'])

        user.save()



        return user

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

class UserWithBookingSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = '__all__'

# class FlightSearchSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FlightSearch
#         fields = '__all__'

class HotelBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelBooking
        fields = '__all__'
