# Generated by Django 5.0.4 on 2024-07-09 18:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_alter_user_is_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='hotelbooking',
            name='models',
            field=models.CharField(default='Booked', max_length=100),
        ),
    ]
