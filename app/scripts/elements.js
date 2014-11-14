$(document).on('authToken.received', function() {
  var selectedElement = null;
  var mouseOffset = null;

  $('.draggable').click(function(event) {
    event.stopPropagation();

    var draggable = $(this);
    var elementPosition = draggable.offset();

    mouseOffset = {
      x: event.clientX - elementPosition.left,
      y: event.clientY - elementPosition.top,
    };

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

      moveElementToMouse(e);
      placeElement(e);

      draggable.css('opacity', '1');
      selectedElement.remove();
      $('body').off('mousemove click');
    });

    moveElementToMouse(event);
  });

  var placeElement = function placeElement(event) {
    Weebly.placeElement({
      element: selectedElement,
      x: event.clientX,
      y: event.clientY
    });
  }

  var updateElement = function updateElement(event) {
    moveElementToMouse(event);

    Weebly.showElementPlace({
      x: event.clientX,
      y: event.clientY
    });
  }

  var moveElementToMouse = function moveElementToMouse(event) {
    selectedElement.css({
      left: event.clientX - mouseOffset.x,
      top: event.clientY - mouseOffset.y
    })
  };

  // Create different elements
  Weebly.element = function createElement(config) {
    var container = $('<div class="page-element"></div>');
    if(!config.fixed) {
      container.addClass('dynamic');
    }

    // Create the meat of the element
    var element = buildElement[config.type](config);

    // Pack it up
    container.append(element.container);
    element.container = container;

    return element;
  };

  var buildElement = {
    image: ImageElement,
    title: TitleElement,
    text: TextElement
  };
});

var TextElement = function(config) {
  var element = {};

  // Elements we keep track of:
  // |container|
  //   |deleteButton| - visible during editing
  //   |display| - for seeing
  //   |textarea| - for editing
  //   |sizer| - for resizing textarea
  var container, display, textarea, sizer;
  var deleteButton;

  var type = config.type;
  if(config.type !== 'text') {
    type += ' text';
  }
  if(!config.text) {
    config.text = '';
  }

  container = $('<div class="' + type + '"></div>');

  // Create main divs
  if(!config.fixed) {
    deleteButton = $('<div class="delete-element text"></div>');    
  }
  display = $('<div class="' + type + '"></div>');
  textarea = $('<textarea class="' + type + '"></textarea>');
  sizer = $('<div class="textarea ' + type + '"></div>');

  // Never show this dude
  sizer.hide();

  // Initialize main divs
  display.html(config.text.replace(/\n/g, '<br>'));
  textarea.html(config.text);
  sizer.html(config.text.replace(/\n/g, '<br>') + '<br>');

  // Put 'em in, hoo hah
  container.append([display, textarea, sizer]);

  element.container = container;
  element._delete = {
    button: deleteButton,
    trigger: function() {
      if(config.fixed) {
        return false;
      }
      
      if(deleteButton.hasClass('confirm')) {
        return true;
      }
      textarea.parent().addClass('delete');
      deleteButton.addClass('confirm');
      return false;
    },
    cancel: function() {
      if(config.fixed) {
        return false;
      }
      
      textarea.parent().removeClass('delete');
      deleteButton.removeClass('confirm');
    }
  };
  
  // Set up textarea
  element.init = function init() {
    textarea.width(display.width() - 48);
    textarea.resizable({
      handles: 'e, s, w',
      maxWidth: display.width() - 40
    });
  
    textarea.parent().hide();
    deleteButton.appendTo(textarea.parent());
  };
  
  // Edit the textarea
  element.edit = function edit() {
    textarea.height(display.height() + 16);
    if(textarea.parent().width() > display.width('100%').width()) {
      textarea.parent().width(display.width());
      textarea.width(display.width() - 44);
    }
    textarea.resizable({
      handles: 'e, s, w',
      maxWidth: display.width()
    });

    display.hide();
    textarea.parent().show();

    resizeTextarea();
    textarea.focus();
  };

  element.finalize = function finalize() {
    display.html(textarea.val().replace(/\n/g, '<br>')).show();
    textarea.parent().hide();
  };

  element.val = function val() {
    return {
      type: config.type,
      text: textarea.val(),
      fixed: !!config.fixed
    };
  };

  var resizeTextarea = function resizeTextarea() {
    sizer.width(textarea.width());
    textarea.height(sizer.height());
    textarea.parent().height(sizer.height() + 44);
  }

  textarea.keyup(function(event) {
    sizer.html(textarea.val().replace(/\n/g, '<br>') + '<br>');
    resizeTextarea();
  });

  return element;
};

var TitleElement = function(config) {
  var element = {};

  // Elements we keep track of:
  // |container|
  //   |deleteButton| - visible during editing
  //   |display| - for seeing
  //   |input| - for editing
  var container, display, input;
  var deleteButton;

  var type = config.type;
  if(config.type !== 'title') {
    type += ' title';
  }
  if(!config.text) {
    config.text = '';
  }

  container = $('<div class="' + type + '"></div>');

  // Create main divs
  if(!config.fixed) {
    deleteButton = $('<div class="delete-element title"></div>');    
    deleteButton.hide();
  }
  display = $('<div class="' + type + '"></div>');
  input = $('<input type="text" class="' + type + '" />');

  // Initialize main divs
  display.html(config.text);
  input.val(config.text);

  // Put 'em in, hoo hah
  container.append([deleteButton, display, input]);

  element.container = container;
  element._delete = {
    button: deleteButton,
    trigger: function() {
      if(config.fixed) {
        return false;
      }

      if(deleteButton.hasClass('confirm')) {
        return true;
      }
      input.addClass('delete');
      deleteButton.addClass('confirm');
      return false;
    },
    cancel: function() {
      if(config.fixed) {
        return false;
      }
      
      input.removeClass('delete');
      deleteButton.removeClass('confirm');
    }
  };
  
  // Set up textarea
  element.init = function init() {
    input.hide();
  };
  
  // Edit the textarea
  element.edit = function edit() {
    display.hide();
    input.show().focus();
    if(!config.fixed) {
      deleteButton.show();
    }
  };

  element.finalize = function finalize() {
    display.html(input.val()).show();
    input.hide();

    if(!config.fixed) {
      deleteButton.hide();
    }
  };

  element.val = function val() {
    return {
      type: config.type,
      text: input.val(),
      fixed: !!config.fixed
    };
  };

  return element;
};

var ImageElement = function(config) {
  var element = {};

  // Elements we keep track of:
  // |container|
  //   |deleteButton| - visible for deleting
  //   |display| - for seeing
  var container, display;
  var deleteButton;

  var type = config.type;
  if(config.type !== 'image') {
    type += ' image';
  }

  container = $('<div class="' + type + '"></div>');

  // Create main divs
  if(!config.fixed) {
    deleteButton = $('<div class="delete-element image"></div>');    
    deleteButton.hide();
  }
  display = $('<img />');
  
  var buildImage = function buildImage() {
    var placeholderURL = '/weebly_assets/sprites/Image-Placeholder.png';
    if(!config.url) {
      container.addClass('empty');

      var placeholder = $('<div class="placeholder"></div>');
      display.attr('src', placeholderURL);
      var tag = $('<div class="muted">Add Image +</div>');

      placeholder.append(display).append(tag);

      container.html(placeholder); 
    }
    else {
      container.removeClass('empty');

      display.attr('src', config.url);

      container.html(display);
    }
  }

  element.container = container;
  element._delete = {
    trigger: function() {},
    cancel: function() {}
  };

  // Set up textarea
  element.init = function init() {
    buildImage();
  };
  
  // Edit the textarea
  element.edit = function edit() {
  };

  element.finalize = function finalize() {
    buildImage();
  };

  element.val = function val() {
    return {
      type: config.type,
      url: config.url,
      fixed: !!config.fixed
    };
  };

  return element;
};