# Generated by Django 5.0.4 on 2024-07-02 10:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_booking'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='arrival_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='booking',
            name='departure_time',
            field=models.DateTimeField(null=True),
        ),
    ]
