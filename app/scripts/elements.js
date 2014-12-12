$(document).on('authToken.received', function() {
  var mouseOffset = null;

  var placeNewElement = function placeNewElement(loc, element) {
    Weebly.placeNewElement({
      element: element,
      x: loc.x,
      y: loc.y
    });
  };

  Weebly.Draggable($('.draggable'), placeNewElement);

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
  var textMinHeight = 120;

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
    config.text = ' ';
  }

  container = $('<div class="' + type + '"></div>');

  // Create main divs
  if(!config.fixed || config.fixed === 'false') {
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
  // sizer.css({display: 'block'
  // });

  // Put 'em in, hoo hah
  container.append([display, textarea, sizer]);
  if(config.height) {
    element.customHeight = config.height;
    display.height(config.height);
  }

  element.custom = true;
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
      handles: 's',
      maxWidth: display.width() - 40,
      minHeight: textMinHeight,
      resize: function() {
        if(!element.custom) {
          textarea.val(Weebly.LoremIpsum(textarea.height() / 21));
        }
      },
      stop: function(e, ui) {
        if(textarea.height() < sizer.height()) {
          textarea.height(sizer.height());
          ui.element.height(sizer.height() + 44);
          delete element.customHeight;
        }
        else {
          element.customHeight = textarea.height();
        }
      }
    });
  
    textarea.parent().hide();
    if(deleteButton)
      deleteButton.appendTo(textarea.parent());
  };
  
  // Edit the textarea
  element.edit = function edit() {
    if(textarea.parent().width() > display.width('100%').width()) {
      textarea.parent().width(display.width());
      textarea.width(display.width() - 44);
    }

    display.hide();
    textarea.parent().show();

    resizeTextarea();
    textarea.focus();
  };

  element.finalize = function finalize() {
    display.html(textarea.val().replace(/\n/g, '<br>') + '<br>').show();
    if(element.customHeight)
      display.height(element.customHeight);
    else
      display.height('auto');

    textarea.parent().hide();
  };

  element.val = function val() {
    if($.trim(textarea.val()) === '')
      return false;

    var val = {
      type: config.type,
      text: textarea.val(),
      fixed: !!config.fixed
    };
    if(element.customHeight)
      val.height = element.customHeight;

    return val;
  };

  var resizeTextarea = function resizeTextarea() {
    sizer.width(textarea.width());

    sizer.width();
    var textHeight = sizer.height();
    if(textHeight < textMinHeight)
      textHeight = textMinHeight;
    if(textHeight < element.customHeight)
      textHeight = element.customHeight;


    textarea.height(textHeight);
    textarea.parent().height(textHeight + 44);

    if($.trim(textarea.val()) === '') {
      // Fill it with lorem ipsum baby
      element.custom = false;
    }
  }

  textarea.keyup(function(event) {
    if(textarea.val().length === 0)
      textarea.val(' ');

    sizer.html(textarea.val().replace(/\n/g, '<br>') + '<br>');
    element.custom = true;
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
  if(config.fixed === 'false') config.fixed = false;
  if(!config.fixed) {
    deleteButton = $('<div class="delete-element image"></div>');    
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

      container.html([deleteButton, placeholder]); 
    }
    else {
      container.removeClass('empty');

      display.attr('src', config.url);

      container.html([deleteButton, display]);
    }
  }

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
      container.addClass('delete');
      deleteButton.addClass('confirm');
      return false;
    },
    cancel: function() {
      if(config.fixed) {
        return false;
      }
      
      container.removeClass('delete');
      deleteButton.removeClass('confirm');
    }
  };

  // Set up textarea
  element.init = function init() {
    buildImage();
  };
  
  // Edit the textarea
  element.edit = function edit() {
    element.editing = false;
    element.container.attr('no-drag', 'false');
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