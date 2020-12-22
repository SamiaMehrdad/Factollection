from django import http
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Max
from .forms import CreateUserForm
from .models import AuthUser, UserSheet, Fact_API, Fact
from datetime import date
import json

@login_required(login_url='home')
def index(request):
    # get the AuthUser and call the sheet and related facts and links
    if request.method == "POST" :
        return get_facts( request )
    user_id = AuthUser.objects.get(id = request.user.id)
    sheets = UserSheet.objects.all().filter(auth_user = user_id.id) 
    data_list = []
    for sheet in sheets:
        facts = list(UserSheet.get_user_sheet_facts(sheet.id))
        sheet_list = {'sheet' :sheet, 'facts' :facts}
        data_list.append(sheet_list) 
    for sheet in data_list:
        sheet['fact_length'] = len(sheet['facts'])
    random_fact = Fact_API.trivia_fact_random()
    random_fact['text'] = normalize(random_fact['text'], 140)
    return render(request,'index.html', {'data' :data_list, 'user' :request.user, 'random_fact' :random_fact})

def home(request):
    if request.user.is_authenticated:
        return redirect('index')
    else:
        #api call for random trivia fact and date fact for today
        date_fact = Fact_API.date_fact_today()
        trivia_fact = Fact_API.trivia_fact_random() 
        context = {'date_fact' :date_fact, 
                    'trivia_fact' :trivia_fact,}
        return render(request, 'home.html', context)

def register(request):
    if request.user.is_authenticated:
        return redirect('index')
    else:
        form = CreateUserForm
        if request.method == "POST":
            form = CreateUserForm(request.POST)
            if form.is_valid():
                form.save()
                user = form.cleaned_data.get('username')
                messages.success(request, 'User ' + user + ' Created Successfully!!')
                return redirect('/loginPage/')
            else: print(form.errors)

    context = {'form' :form}
    return render(request, 'auth/register.html', context)

def loginPage(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('/index/')
            else: 
                messages.info(request, 'Username or Password is Inncorrect')
        context = {}
        return render(request, 'auth/login.html')

def logoutUser(request):
    logout(request)
    return redirect('/home')


@login_required(login_url='home')
def sheet_detail(request, user_sheet_id):
    sheet = UserSheet.objects.get(id = user_sheet_id)
    facts = list(UserSheet.get_user_sheet_facts(sheet.id))
    #facts = ["fact test one", "test two", "another fact: three"]; #TEST
    links = list(UserSheet.get_user_sheet_links(sheet.id))
    context = {'sheet' :sheet, 'facts': facts, 'links' :links, 'id':user_sheet_id}
    return render(request, 'details.html', context)


def get_facts(request):
    # remove quotes and seperate the requests
    extra_char = '"'
    print(request.body)
    text = request.body.decode("utf-8").split(':')
    fact_type = text[0].replace(extra_char, '')
    fact_subject = text[1].replace(extra_char, '')
    if fact_type == 'trivia':
        fact = Fact_API.trivia_fact(fact_subject)
    elif fact_type == 'math':
        fact = Fact_API.math_fact(fact_subject)
    else:
        fact = Fact_API.year_fact(fact_subject)
    print(fact['type'])
    fact = {'text' :fact["text"],
            'number' :fact["number"]
    }
    return JsonResponse(fact)


def add_fact (request, fact_text, sub, fact_type):
    user = AuthUser.objects.get(id = request.user.id)
    # check to see if other sheets have the same "subject"
    try: # if there is a matching sheet then add fact to that sheet 
        matching_sheet_subject = UserSheet.objects.get(auth_user = user, subject = sub)
        new_fact = Fact.objects.create(user_sheet=matching_sheet_subject, text=fact_text, number=sub, found=True, fact_type=fact_type)
    except UserSheet.DoesNotExist: # if there isnt a matching sheet then create a new sheet and add the fact to that
        sheet = UserSheet.objects.create(auth_user=user, subject=sub)
        new_fact = Fact.objects.create(user_sheet=sheet, text=fact_text, number=sub, found=True, fact_type=fact_type)
    return redirect('/index/')

def save_note(request, user_sheet_id, note_text):
    sheet = UserSheet.objects.filter(id = user_sheet_id).update(note=note_text)
    return redirect(f'/details/{user_sheet_id}')

def delete_sheet(request, user_sheet_id):
    user = AuthUser.objects.get(id = request.user.id)
    sheet = UserSheet.objects.get(auth_user=user, id=user_sheet_id)
    sheet.delete()
    return redirect('/index/')

@login_required(login_url='home')
def delete_fact(request, fact_id):
    fact = Fact.objects.get(id = fact_id)
    user_sheet_id = fact.user_sheet.id
    fact.delete()
    return redirect(f'/details/{user_sheet_id}')
    

############################### HELPING FUNCTIONS ###############################

''' 
normalize( str, len )
this function returns a string that is equal to
str, but with a fixed length of len
return : string
'''
def normalize( str, length ):
    # if str is too ling, truncate and add '...' to the end
    if len(str) >= length :
        return str[0:length-3]+"..."
    # else, str is too short, add non-breakable space to the end    
    else:
        return str + chr(32) * ( length -len(str) )


'''
get_all_facts( subject, type )
this function will send multiple requests to api ,
ignoring repeating results, return a list of all facts
attemping to request api should be limited to ?
parameters: subject: number or date | type:"Math","Trivia" or "Date"
'''
def get_all_facts( subject, type ):
    pass