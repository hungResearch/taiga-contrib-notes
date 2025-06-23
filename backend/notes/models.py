from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Note(models.Model):
    name = models.CharField(max_length=255,  default="Untitled note")  # Tiêu đề note, dùng chung cho tất cả version
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')  # Người tạo
    created_at = models.DateTimeField(auto_now_add=True)  # Thời gian tạo note
    is_deleted = models.BooleanField(default=False)
    # Trỏ đến version hiện tại
    current_version = models.ForeignKey('NoteVersion', null=True, blank=True, on_delete=models.SET_NULL, related_name='+')

    def __str__(self):
        return f'Note #{self.id} - {self.name} by {self.creator.username}'

class NoteVersion(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='versions')
    content = models.TextField()  # Nội dung của version này
    version_number = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)  # Thời gian tạo version (chính là update note)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='note_versions')
    is_rollback = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('note', 'version_number')
        ordering = ['-version_number']

    def __str__(self):
        return f'NoteVersion #{self.id} v{self.version_number} of Note #{self.note.id}'
