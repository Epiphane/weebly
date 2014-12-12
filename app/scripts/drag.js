(function() {
  var selectedElement = null;
  var dragThreshhold = 30;

  Weebly.Draggable = function(elements, placeCallback) {
    elements.mousedown(function(event) {
      event.stopPropagation();

      var draggable = $(this);
      if(draggable.attr('no-drag') === 'true')
        return;

      var elementPosition = draggable.offset();

      mouseOffset = {
        x: event.clientX - elementPosition.left,
        y: event.clientY - elementPosition.top,
      };

      var beginDrag = function() {
        draggable.css('opacity', '0');
        selectedElement = draggable.clone();
        selectedElement.addClass('dragging')
          .css('opacity', '0.5')
          .animate({
            opacity: 1
          }, 250);


        $('body').append(selectedElement).mousemove(updateElement);
        $('body').click(function(e) {
          e.stopPropagation();

          var offset = selectedElement.offset();
          moveElementToMouse(e);
          placeCallback({
            x: offset.left + selectedElement.width() / 2,
            y: offset.top + selectedElement.height() / 2
          }, selectedElement);

          draggable.css('opacity', '1');
          selectedElement.remove();
          $('body').off('mousemove click');
        });

        moveElementToMouse(event);
      }

      $('body').mousemove(function(e) {
        var offset = Math.abs(event.clientX - e.clientX)
                   + Math.abs(event.clientY - e.clientY);

        if(offset > dragThreshhold) {
          $(this).off('mousemove');
          beginDrag();
        }
      });
      $('body').mouseup(function() {
        $(this).off('mousemove');
      })
    });
  };

  var updateElement = function updateElement(event) {
    moveElementToMouse(event);

    var offset = selectedElement.offset();
    Weebly.showElementPlace({
      x: offset.left + selectedElement.width() / 2,
      y: offset.top + selectedElement.height() / 2
    });
  };

  var moveElementToMouse = function moveElementToMouse(event) {
    selectedElement.css({
      left: event.clientX - mouseOffset.x,
      top: event.clientY - mouseOffset.y
    })
  };
})();