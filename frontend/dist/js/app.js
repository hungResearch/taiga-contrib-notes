(function() {
  angular.module('taiga.plugins.notes', ['ngRoute']).config([
    '$routeProvider',
    function($routeProvider) {
      return $routeProvider.when('/notes',
    {
        templateUrl: 'partials/notes.html',
        controller: 'NotesListController'
      }).when('/notes/create',
    {
        templateUrl: 'partials/note-edit.html',
        controller: 'NoteEditPageController'
      }).when('/notes/:id/edit',
    {
        templateUrl: 'partials/note-edit.html',
        controller: 'NoteEditPageController'
      }).otherwise({
        redirectTo: '/notes'
      });
    }
  ]);

}).call(this);

(function() {
  angular.module('taiga.plugins.notes').controller('NotesListController', [
    '$scope',
    '$location',
    '$http',
    function($scope,
    $location,
    $http) {
      var API_BASE;
      API_BASE = 'http://127.0.0.1:8000/api';
      $scope.notes = [];
      $scope.searchQuery = "";
      $scope.loadNotes = function() {
        return $http.get(`${API_BASE}/notes/`).then(function(res) {
          return $scope.notes = res.data;
        });
      };
      $scope.goToCreate = function() {
        return $location.path('/notes/create');
      };
      $scope.editNote = function(note) {
        return $location.path('/notes/' + note.id + '/edit');
      };
      $scope.downloadNote = function(note) {
        var a,
    blob;
        blob = new Blob([note.current_version_content || ''],
    {
          type: 'text/html'
        });
        a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${note.name || 'note'}.html`;
        return a.click();
      };
      $scope.deleteNote = function(note) {
        if (confirm(`Bạn có chắc muốn xóa ghi chú '${note.name}'?`)) {
          return $http.delete(`${API_BASE}/notes/${note.id}/`).then(function() {
            return $scope.loadNotes();
          });
        }
      };
      // Hàm lấy ngày cập nhật mới nhất (của current_version)
      $scope.getUpdatedAt = function(note) {
        var ver;
        if (note.current_version_id && note.versions) {
          ver = note.versions.find(function(v) {
            return v.id === note.current_version_id;
          });
          return (ver != null ? ver.created_at : void 0) || note.created_at;
        } else {
          return note.created_at;
        }
      };
      return $scope.loadNotes();
    }
  ]);

  angular.module('taiga.plugins.notes').controller('NoteEditPageController', [
    '$scope',
    '$location',
    '$timeout',
    '$routeParams',
    '$http',
    function($scope,
    $location,
    $timeout,
    $routeParams,
    $http) {
      var API_BASE,
    editorInit,
    loadNoteAndVersions,
    noteId,
    ref;
      API_BASE = 'http://127.0.0.1:8000/api';
      noteId = (ref = $routeParams.id) != null ? ref : null;
      $scope.note = {
        name: "",
        content: "",
        creator: 1
      };
      $scope.versions = [];
      $scope.selectedVersion = null;
      loadNoteAndVersions = function() {
        if (noteId != null) {
          return $http.get(`${API_BASE}/notes/${noteId}/`).then(function(res) {
            $scope.note = res.data;
            $scope.versions = $scope.note.versions || [];
            // Mặc định, chọn version hiện tại
            $scope.selectedVersion = $scope.versions.find(function(v) {
              return v.id === $scope.note.current_version_id;
            });
            return $timeout(editorInit,
    0);
          },
    function(err) {
            alert("Note không tồn tại hoặc lỗi server.");
            return $location.path('/notes');
          });
        } else {
          $scope.versions = [];
          $scope.note = {
            name: "",
            content: "",
            creator: 1
          };
          $scope.selectedVersion = null;
          return $timeout(editorInit,
    0);
        }
      };
      // Hàm chọn version để preview
      $scope.selectVersion = function(ver) {
        $scope.selectedVersion = ver;
        if (window.editorInstance != null) {
          return window.editorInstance.setData(ver.content || "");
        }
      };
      // Hàm phục hồi về version đang chọn
      $scope.restoreSelectedVersion = function() {
        var ver;
        ver = $scope.selectedVersion;
        if (!ver || ver.id === $scope.note.current_version_id) {
          alert("Vui lòng chọn version khác version hiện tại để phục hồi!");
          return;
        }
        return $http.post(`${API_BASE}/notes/${noteId}/restore_version/`,
    {
          version_id: ver.id
        }).then(function(res) {
          $scope.note = res.data;
          $scope.versions = $scope.note.versions || [];
          // Chọn lại version hiện tại mới nhất sau phục hồi
          $scope.selectedVersion = $scope.versions.find(function(v) {
            return v.id === $scope.note.current_version_id;
          });
          if (window.editorInstance != null) {
            return window.editorInstance.setData($scope.note.current_version_content || "");
          }
        });
      };
      // Hàm khởi tạo CKEditor
      editorInit = function() {
        if (window.editorInstance != null) {
          window.editorInstance.destroy();
        }
        return ClassicEditor.create(document.querySelector('#noteContent')).then(function(editor) {
          window.editorInstance = editor;
          editor.model.document.on('change:data',
    function() {
            if (!$scope.$$phase) {
              return $scope.$apply(function() {
                return $scope.note.content = editor.getData();
              });
            } else {
              return $scope.note.content = editor.getData();
            }
          });
          // Khi load lần đầu, editor hiển thị đúng content của version hiện tại
          return editor.setData($scope.note.current_version_content || "");
        }).catch(function(err) {
          return console.error("CKEditor init failed:",
    err);
        });
      };
      // Lưu note (tạo/sửa)
      $scope.save = function() {
        var dataToSend;
        if (window.editorInstance != null) {
          $scope.note.content = window.editorInstance.getData();
        }
        dataToSend = {
          name: $scope.note.name,
          content: $scope.note.content,
          creator: $scope.note.creator
        };
        if (noteId != null) {
          return $http.put(`${API_BASE}/notes/${noteId}/`,
    dataToSend).then(function() {
            return $location.path('/notes');
          });
        } else {
          return $http.post(`${API_BASE}/notes/`,
    dataToSend).then(function(res) {
            return $location.path('/notes');
          });
        }
      };
      $scope.back = function() {
        return $location.path('/notes');
      };
      $scope.$on('$destroy',
    function() {
        if (window.editorInstance != null) {
          window.editorInstance.destroy();
          return window.editorInstance = null;
        }
      });
      return loadNoteAndVersions();
    }
  ]);

}).call(this);

//# sourceMappingURL=app.js.map
