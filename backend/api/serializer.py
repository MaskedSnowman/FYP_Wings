from rest_framework import serializers
from .models import *
from django.contrib.auth import get_user_model, authenticate
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import Token
User = get_user_model()

# class UserRegisterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserModel
#         fields = ['first_name', 'last_name', 'email', 'phone', 'password']

#     def create(self, validated_data):
#         user_obj = UserModel.objects.create_user(
#             email=validated_data['email'], 
#             password=validated_data['password'],
#             first_name=validated_data['first_name'],
#             last_name=validated_data['last_name'],
#             phone=validated_data['phone']
#         )
#         user_obj.save()
#         return user_obj

# class UserLoginSerializer(serializers.Serializer):
# 	email = serializers.CharField()
# 	password = serializers.CharField()
# 	##
# 	def check_user(self, clean_data):
# 		user = authenticate(email=clean_data['email'], password=clean_data['password'])
# 		if not user:
# 			raise ValidationError('user not found')
# 		return user

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserModel
#         fields = ['first_name', 'last_name', 'email', 'phone', 'password']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']

class UserToken(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user) -> Token:
        token = super().get_token(user)

        token['full_name'] = user.profile.full_name
        token['email'] = user.email
        token['allergies'] = user.profile.allergies

        return token

# class ProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Profile
#         fields = ('full_name', 'allergies', 'verified')

# class UserWithProfileSerializer(serializers.ModelSerializer):
#     profile = ProfileSerializer()

#     class Meta:
#         model = User
#         fields = ('id', 'email', 'profile')

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True, required = True, validators = [validate_password])
    password2 = serializers.CharField(write_only = True, required = True)
    firstName = serializers.CharField(write_only = True, required = True)
    lastName = serializers.CharField(write_only = True, required = True)
    phone = serializers.CharField(write_only = True, required = True)

    class Meta:
        model = User
        fields = ['firstName', 'lastName', 'phone', 'email', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password':"Password Fields Didn't Match"}
            )
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create(
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])

        user.save()

        if "firstName" in validated_data:
            user.profile.full_name = validated_data['firstName']
            user.profile.save()

        return user
    
class HotelBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelBooking
        fields = '__all__'

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

class FlightSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightSearch
        fields = '__all__'