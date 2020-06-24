from rest_framework import serializers
from .models import Task

# This file is to serialize our objects into JSON so we can send them via the API


# To serialize a model
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task  # What model we will serialize
        fields = '__all__'  # What fields of the object we want to serialize
