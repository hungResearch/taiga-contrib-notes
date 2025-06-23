from rest_framework import serializers
from .models import Note, NoteVersion
from django.contrib.auth import get_user_model

User = get_user_model()

class NoteVersionSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = NoteVersion
        fields = [
            'id', 'note', 'content', 'version_number',
            'created_at', 'created_by', 'created_by_username', 'is_rollback'
        ]

class NoteSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source="creator.username", read_only=True)
    versions = NoteVersionSerializer(many=True, read_only=True)
    current_version_content = serializers.SerializerMethodField()
    current_version_id = serializers.IntegerField(source='current_version.id', read_only=True)
    name = serializers.CharField(required=True)
    content = serializers.CharField(write_only=True, required=False)  # chỉ dùng để gửi lên khi tạo/sửa nội dung

    class Meta:
        model = Note
        fields = [
            'id', 'name', 'creator', 'creator_username', 'created_at', 'is_deleted',
            'current_version_id', 'current_version_content', 'content', 'versions'
        ]
        read_only_fields = [
            'current_version_content', 'current_version_id', 'versions', 'creator_username'
        ]

    def get_current_version_content(self, obj):
        if obj.current_version:
            return obj.current_version.content
        return None

    def create(self, validated_data):
        content = validated_data.pop('content', None)
        note = Note.objects.create(**validated_data)
        creator = note.creator if note.creator_id else None  # kiểm tra creator

        # Nếu có content, tạo version đầu tiên
        if content:
            version = NoteVersion.objects.create(
                note=note,
                content=content,
                version_number=1,
                created_by=creator
            )
            note.current_version = version
            note.save(update_fields=['current_version'])
        return note

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        content = validated_data.pop('content', None)

        if content is not None:
            last_version = instance.versions.order_by('-version_number').first()
            next_version_number = last_version.version_number + 1 if last_version else 1
            creator = instance.creator if instance.creator_id else None  # kiểm tra creator

            version = NoteVersion.objects.create(
                note=instance,
                content=content,
                version_number=next_version_number,
                created_by=creator
            )
            instance.current_version = version

        instance.save()
        return instance
