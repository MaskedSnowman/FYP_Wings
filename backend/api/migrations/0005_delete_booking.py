# Generated by Django 5.0.4 on 2024-07-02 06:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_remove_booking_full_name_remove_booking_smtg_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Booking',
        ),
    ]
