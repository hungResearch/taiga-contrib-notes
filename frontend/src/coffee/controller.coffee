angular.module('taiga.plugins.notes')
.controller('NotesListController', [
  '$scope', '$location', '$http',
  ($scope, $location, $http) ->

    API_BASE = 'http://127.0.0.1:8000/api'
    $scope.notes = []
    $scope.searchQuery = ""

    $scope.loadNotes = ->
      $http.get("#{API_BASE}/notes/").then (res) ->
        $scope.notes = res.data

    $scope.goToCreate = -> $location.path('/notes/create')

    $scope.editNote = (note) -> $location.path('/notes/' + note.id + '/edit')

    $scope.downloadNote = (note) ->
      blob = new Blob([note.current_version_content or ''], { type: 'text/html' })
      a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "#{note.name or 'note'}.html"
      a.click()

    $scope.deleteNote = (note) ->
      if confirm("Bạn có chắc muốn xóa ghi chú '#{note.name}'?")
        $http.delete("#{API_BASE}/notes/#{note.id}/").then -> $scope.loadNotes()

    # Hàm lấy ngày cập nhật mới nhất (của current_version)
    $scope.getUpdatedAt = (note) ->
      if note.current_version_id and note.versions
        ver = note.versions.find (v) -> v.id == note.current_version_id
        return ver?.created_at or note.created_at
      else
        return note.created_at

    $scope.loadNotes()
])

angular.module('taiga.plugins.notes')
.controller('NoteEditPageController', [
  '$scope', '$location', '$timeout', '$routeParams', '$http',
  ($scope, $location, $timeout, $routeParams, $http) ->

    API_BASE = 'http://127.0.0.1:8000/api'
    noteId = $routeParams.id ? null
    $scope.note = { name: "", content: "", creator: 1 }
    $scope.versions = []
    $scope.selectedVersion = null

    loadNoteAndVersions = ->
      if noteId?
        $http.get("#{API_BASE}/notes/#{noteId}/").then (res) ->
          $scope.note = res.data
          $scope.versions = $scope.note.versions or []
          # Mặc định, chọn version hiện tại
          $scope.selectedVersion = $scope.versions.find (v) -> v.id == $scope.note.current_version_id
          $timeout(editorInit, 0)
        , (err) ->
          alert("Note không tồn tại hoặc lỗi server.")
          $location.path('/notes')
      else
        $scope.versions = []
        $scope.note = { name: "", content: "", creator: 1 }
        $scope.selectedVersion = null
        $timeout(editorInit, 0)

    # Hàm chọn version để preview
    $scope.selectVersion = (ver) ->
      $scope.selectedVersion = ver
      if window.editorInstance?
        window.editorInstance.setData(ver.content or "")

    # Hàm phục hồi về version đang chọn
    $scope.restoreSelectedVersion = ->
      ver = $scope.selectedVersion
      if not ver or ver.id == $scope.note.current_version_id
        alert("Vui lòng chọn version khác version hiện tại để phục hồi!")
        return
      $http.post("#{API_BASE}/notes/#{noteId}/restore_version/", { version_id: ver.id }).then (res) ->
        $scope.note = res.data
        $scope.versions = $scope.note.versions or []
        # Chọn lại version hiện tại mới nhất sau phục hồi
        $scope.selectedVersion = $scope.versions.find (v) -> v.id == $scope.note.current_version_id
        if window.editorInstance?
          window.editorInstance.setData($scope.note.current_version_content or "")

    # Hàm khởi tạo CKEditor
    editorInit = ->
      if window.editorInstance?
        window.editorInstance.destroy()
      ClassicEditor
        .create(document.querySelector('#noteContent'))
        .then (editor) ->
          window.editorInstance = editor
          editor.model.document.on('change:data', ->
            if not $scope.$$phase
              $scope.$apply -> $scope.note.content = editor.getData()
            else
              $scope.note.content = editor.getData()
          )
          # Khi load lần đầu, editor hiển thị đúng content của version hiện tại
          editor.setData($scope.note.current_version_content or "")
        .catch (err) -> console.error("CKEditor init failed:", err)

    # Lưu note (tạo/sửa)
    $scope.save = ->
      if window.editorInstance?
        $scope.note.content = window.editorInstance.getData()
      dataToSend =
        name: $scope.note.name
        content: $scope.note.content
        creator: $scope.note.creator
      if noteId?
        $http.put("#{API_BASE}/notes/#{noteId}/", dataToSend).then -> $location.path('/notes')
      else
        $http.post("#{API_BASE}/notes/", dataToSend).then (res) -> $location.path('/notes')

    $scope.back = -> $location.path('/notes')

    $scope.$on('$destroy', ->
      if window.editorInstance?
        window.editorInstance.destroy()
        window.editorInstance = null
    )

    loadNoteAndVersions()
])
