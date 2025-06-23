# notes/views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Note, NoteVersion
from .serializers import NoteSerializer, NoteVersionSerializer
from rest_framework import status

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

    @action(detail=True, methods=['post'])
    def restore_version(self, request, pk=None):
        version_id = request.data.get('version_id')
        try:
            note = Note.objects.get(pk=pk)
            version = note.versions.get(pk=version_id)

            user = request.user if request.user.is_authenticated else None  # ✅ fix ở đây

            # Tạo version mới từ version được chọn
            new_version = NoteVersion.objects.create(
                note=note,
                content=version.content,
                version_number=(note.versions.order_by('-version_number').first().version_number + 1),
                is_rollback=True,
                created_by=user  # ✅ không còn gán AnonymousUser
            )

            note.current_version = new_version
            note.save(update_fields=['current_version'])

            serializer = self.get_serializer(note)
            return Response(serializer.data)

        except Note.DoesNotExist:
            return Response({'error': 'Note không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        except NoteVersion.DoesNotExist:
            return Response({'error': 'Version không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NoteVersionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NoteVersion.objects.all()
    serializer_class = NoteVersionSerializer
