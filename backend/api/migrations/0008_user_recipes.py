# Generated by Django 5.0.4 on 2024-07-02 15:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_alter_booking_arrival_time_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='recipes',
            field=models.TextField(default=list),
        ),
    ]