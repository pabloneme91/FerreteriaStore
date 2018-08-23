adminMiApp.directive("alertMessage", function($compile) {
    return {
        scope: {
            alert: "="
        },
        link: function (scope, element) {
            // Actualiza el mensaje de alerta cada vez que el objeto es modificado.
            scope.$watch('alert', function () {
                updateAlert();
            });
 
            // Cerrar mensaje de alerta
            scope.close = function() {
                scope.alert = null;
            }
 
            function updateAlert() {
                var html = "";
 
                if (scope.alert) {
                    var icon = null;
 
                    switch (scope.alert.type) {
                        case 'success': {
                            icon = 'ok-sign';
                        } break;
                        case 'warning': {
                            icon = 'exclamation-sign';
                        } break;
                        case 'info': {
                            icon = 'info-sign';
                        } break;
                        case 'danger': {
                            icon = 'ban-circle';
                        } break;
                    }
 
                    html = "<div class='alert alert-" + scope.alert.type + "' role='alert'>";
 
                    
                    if (icon) {
                        html += "<span style='padding-right: 5px;' class='glyphicon glyphicon-" + icon + "' aria-hidden='true'></span>";
                    }
 
                    html += scope.alert.text;

                    if (scope.alert.closable) {
                        html += "<span style='padding-left: 5px;' class='glyphicon glyphicon-remove-sign' " +
                        " aria-hidden='true' ng-click='alert = null'></span>";    
                    }

                    html += "</div>";
                }
 
                var newElement = angular.element(html);
                var compiledElement = $compile(newElement)(scope);
 
                element.html(compiledElement);
 
                if (scope.alert && scope.alert.delay > 0) {
                    setTimeout(function () {
                        scope.alert = null;
                        scope.$apply();
                    }, scope.alert.delay * 1000);
                }
            }
        }
     }
});