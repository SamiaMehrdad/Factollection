from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('loginPage/', views.loginPage, name='loginPage'),
    path('logout/', views.logoutUser, name='logout'),
    path('home/', views.home, name='home'),
    path('index/', views.index, name='index'),
    path('details/<int:user_sheet_id>', views.sheet_detail, name='sheet_detail'),
    path('addfact/<str:fact_text>/<int:sub>/<str:fact_type>', views.add_fact, name='add_fact'),
    path('updatenote/<int:user_sheet_id>/<str:note_text>/', views.save_note, name='save_note'),
    path('deletesheet/<int:user_sheet_id>', views.delete_sheet, name='delete_sheet'),
]