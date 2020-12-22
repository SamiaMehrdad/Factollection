from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('loginPage/', views.loginPage, name='loginPage'),
    path('logout/', views.logoutUser, name='logout'),
    path('home/', views.home, name='home'),
    path('index/', views.index, name='index'),
    # path('index/ss/<int:subject>',views.get_facts, name="index_new"),
    path('details/<int:user_sheet_id>', views.sheet_detail, name='sheet_detail'),
    path('addfact/<str:fact_text>/<int:sub>/<str:type>', views.add_fact, name='add_fact'),
]