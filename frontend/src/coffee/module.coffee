angular.module('taiga.plugins.notes', ['ngRoute'])
.config ['$routeProvider', ($routeProvider) ->
    $routeProvider
        .when('/notes',
            templateUrl: 'partials/notes.html'
            controller: 'NotesListController'
        )
        .when('/notes/create',
            templateUrl: 'partials/note-edit.html'
            controller: 'NoteEditPageController'
        )
        .when('/notes/:id/edit',
            templateUrl: 'partials/note-edit.html'
            controller: 'NoteEditPageController'
        )
        .otherwise(
            redirectTo: '/notes'
        )
]
