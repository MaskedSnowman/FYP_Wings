from django.urls import path,include
from . import views
from .views import *  
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (TokenRefreshView)

router = DefaultRouter()
# router.register('Project',ProjectViewSet,basename='project')
# urlpatterns = router.urls


urlpatterns = [
	# path('register', views.UserRegister.as_view(), name='register'),
	# path('login', views.UserLogin.as_view(), name='login'),
	# path('logout', views.UserLogout.as_view(), name='logout'),
	# path('user', views.UserView.as_view(), name='user'),
    path('getflight', get_aircraft, name='get_aircraft'),
    path('gethotel', SkyscannerHotelSearch, name='gethotel'),
    path('token', views.UserLogin.as_view(),name="token-obtain"),
    path('token/refresh', TokenRefreshView.as_view(), name="refresh-token"),
    path('register', views.RegisterView.as_view(), name="register-user"),
    path('test', views.protectedView, name="test"),
    path('profile', views.profileInfo, name="profileInfo"),
    path('profile2', views.UserProfileUpdate, name="profile2"),
    path('getid', views.getDetailsByID, name="profile2"),
    path('createbooking', views.makeflightbooking, name='makebooking'),
    path('getbooking', views.get_booking_details, name='getbooking'),
    path('hotel/<int:id>', hotel_detail, name='hotel-detail'),
    path('recommend/<str:city>', recommend_hotels, name='recommend-hotels'),
    path('hotelbook', views.makehotelbooking, name='hotels booking'),
    path('admin_report', views.admin_report, name='hotels booking'),
    path('hotel_list', hotel_list.as_view(), name='hotels list'),
    path('gethotelbooking', views.get_hotel_booking_details, name='gethotelbooking'),
    path('cancelbooking', views.cancel_booking, name='cancelbooking'),
    path('hotel_bookings', views.hotel_bookings, name='hotel_bookings'),
    path('cancel_requests', views.cancel_requests, name='cancel_requests'),
    path('admin_cancel_booking', views.admin_cancel_booking, name='admin_cancel_booking'),
    
    
]