from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .forms import CreateUserForm
from .models import AuthUser, UserSheet, Fact_API
from datetime import date
import json


@login_required(login_url='loginPage')
def index(request):
    # get the AuthUser and call the sheet and related facts and links

    if request.method == "POST" :
        get_facts( request )
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
    #api call for random trivia fact and date fact for today
    date_fact = Fact_API.date_fact_today()
    trivia_fact = Fact_API.trivia_fact_random() 
    print(date_fact)
    context = {'date_fact' :date_fact, 
                'trivia_fact' :trivia_fact,}
    return render(request, 'home.html', context)

def register(request):
    if request.user.is_authenticated:
        return redirect('home')
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
    return redirect('/loginPage/')



def sheet_detail(request, user_sheet_id):
    sheet = UserSheet.objects.get(id = user_sheet_id)
    facts = list(UserSheet.get_user_sheet_facts(sheet.id))
    #facts = ["fact test one", "test two", "another fact: three"]; #TEST
    links = list(UserSheet.get_user_sheet_links(sheet.id))
    context = {'sheet' :sheet, 'facts': facts, 'links' :links, 'id':user_sheet_id}
    return render(request, 'details.html', context)


def get_facts(request):
    text = request.body.decode("utf-8")
    print ( type(text), text, "<-----POSTed in get_facts" )

def addFact (request):
    print(request.body,"<----POSTed in affFact")
    return redirect('/index/')
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