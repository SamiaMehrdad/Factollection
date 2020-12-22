from django.db import models
from django.db.models.fields import AutoField
from datetime import date
import requests
import random    
class Fact_API():  
    def math_fact(num):
        response = requests.get(f'http://numbersapi.com/{num}/math?json')
        return response.json()

    def year_fact(year):
        response = requests.get(f'http://numbersapi.com/{year}/year?json')
        return response.json()

    def date_fact(month, day):
        response = requests.get(f'http://numbersapi.com/{month}/{day}/date?json')
        return response.json()

    def date_fact_today():
        today = date.today()
        day = today.strftime('%d')
        month = today.strftime('%m')
        month_abbrv = today.strftime('%b')
        response = requests.get(f'http://numbersapi.com/{month}/{day}/date?json')
        data = response.json()
        data['month_abbrv'] = month_abbrv
        data['day'] = day
        return data
    
    def trivia_fact(num):
        response = requests.get(f'http://numbersapi.com/{num}/?json')
        return response.json()

    # call api for random trivia fact
    def trivia_fact_random(min = None, max = None):
        if min == None or max == None:
            num = random.randint(0, 99)
        else:
            num = random.randint(min, max)
        response = requests.get(f'http://numbersapi.com/{num}/?json')
        fact = response.json()
        # if the number has no fact rerun the function
        if (fact['found'] == False):
            rerun = Fact_API.trivia_fact()
            print('no fact')
        else:
            pass
        return fact
        


class AuthUser(models.Model):
    id = models.IntegerField(primary_key=True)
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()
    class Meta:
        managed = False
        db_table = 'auth_user'

class Fact(models.Model):
    user_sheet = models.ForeignKey('UserSheet', models.DO_NOTHING)
    text = models.CharField(max_length=250)
    year = models.IntegerField(blank=True, null=True)
    number = models.IntegerField()
    found = models.BooleanField()
    fact_type = models.CharField(max_length=250)

    class Meta:
        managed = False
        db_table = 'fact'


class Link(models.Model):
    user_sheet = models.ForeignKey('UserSheet', models.DO_NOTHING)
    title = models.CharField(max_length=250)
    url = models.CharField(max_length=250)

    class Meta:
        managed = False
        db_table = 'link'


class UserSheet(models.Model):
    auth_user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    subject = models.CharField(max_length=250, blank=True, null=True)
    note = models.CharField(max_length=250, blank=True, null=True)
    
    # get all facts for the current sheet
    def get_user_sheet_facts(user_sheet_id):
        user_sheet = UserSheet.objects.get(id = user_sheet_id)
        facts = user_sheet.fact_set.all()
        return facts
    # get all links for the current sheet
    def get_user_sheet_links(user_sheet_id):
        user_sheet = UserSheet.objects.get(id = user_sheet_id)
        links = user_sheet.link_set.all()
        return links

    class Meta:
        managed = False
        db_table = 'user_sheet'