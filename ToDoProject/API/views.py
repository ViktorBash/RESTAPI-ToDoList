from django.shortcuts import render
from django.http import JsonResponse

# These two imports are to make our view an API
from rest_framework.decorators import api_view  # Make view API
from rest_framework.response import Response  # Make view return API response (json or API html page)
from .serializers import TaskSerializer  # The serializer we made for the Task model

from .models import Task

from django.shortcuts import redirect

# Functions have this decorator with "POST" and "GET" to make it an api_view. Class views can also become APIs
@api_view(['GET'])
def apiOverView(request):
    # This is a JSON object which shows the routes a person can use on the API
    # We can also serialize models to JSON format and send it through the API
    api_urls = {
        'List': '/task-list/',
        'Detail View': '/task-detail/<str:pk>/',
        'Create': '/task-create/',
        'Update': '/task-update/<str:pk>/',
        'Delete': '/task-delete/<str:pk>/',
    }
    return Response(api_urls)  # The response where we send our JSON object


# Takes all task objects, puts it in serializer, then returns it as JSON object as Response
@api_view(["GET"])
def taskList(request):
    tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


# Task detail view (same except returns just one task based on the PK passed in)
@api_view(["GET"])
def taskDetail(request, pk):
    task = Task.objects.get(id=pk)
    serializer = TaskSerializer(task, many=False)  # Many=false means it will only return one object
    return Response(serializer.data)


# Create a task via POST request (user sends JSON data that is a Task model)
@api_view(["POST"])
def taskCreate(request):
    serializer = TaskSerializer(data=request.data)  # Sends us a JSON object
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)


# Update view
@api_view(["POST"])
def taskUpdate(request, pk):
    task = Task.objects.get(id=pk)
    serializer = TaskSerializer(instance=task, data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)


# Delete view
@api_view(["DELETE"])
def taskDelete(request, pk):
    task = Task.objects.get(id=pk)
    task.delete()
    return Response("Item deleted")
