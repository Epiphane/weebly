(function() {
  $(document).ready(function() {
    var pageContainer = $('#page-container');
    var pageTabs = $('#page-tabs');
    var selectedPage = -1;
    var pages = [];
    var pageCache = {};

    var currentPage = [];

    // Get existing pages once the API token is loaded
    $(document).on('authToken.received', function(event) {
      Weebly.get({
        url: Weebly.url('pages')
      })
      .done(function(data) {
        pages = data;
        pages.forEach(function(page) {
          addPage({
            name: page.name,
            url: Weebly.url('page', page.id),
            id: page.id,
            animate: false
          })
        });
        selectPage(pages[0].id);
      });
    });

    // Add a new page from the form
    var newPageForm = $('form');
    newPageForm.submit(function(event) {
      var formData = newPageForm.serializeArray()[0];
      var data = {};
      data[formData.name] = formData.value;
      data.config = JSON.stringify([
        {
          type: "title",
          text: "Add Title Here",
          fixed: true
        }
      ]);

      Weebly.post({
        url: Weebly.url('pages'),
        data: data
      })
      .done(function(data) {
        var splitURL = data.url.split('/');
        var pageId = splitURL[splitURL.length - 1];
        addPage({
          name: formData.value, 
          url: data.url || '',
          id: pageId,
          animate: true
        });
      })
      .error(function(err) {
        console.log(err);
      });

      return false;
    });

    var savePage = function savePage() {
      var page = [];
      currentPage.forEach(function(element) {
        page.push(element.val());
      });

      Weebly.put({
        url: Weebly.url('page', selectedPage),
        data: {
          config: JSON.stringify(page)
        }
      });
    };

    var addPage = function addPage(cfg) {
      // Add new page
      var sidebarButton = $('<div></div>');
      sidebarButton.addClass('button primary page-button page-' + cfg.id);
      sidebarButton.html(cfg.name);

      var interfaceDiv = $('<div class="pull-right hover-show"></div>');
      var interfaceEdit = $('<div class="weebly-icon edit fade"></div>');
      var interfaceDelete = $('<div class="weebly-icon delete fade"></div>');
      interfaceDiv.append([interfaceEdit, interfaceDelete]);
      sidebarButton.append(interfaceDiv);
      sidebarButton.insertBefore(newPageForm);

      var container = newPageForm.parent();

      var mainButton = $('<div></div>');
      mainButton.addClass('button fade-in page-button page-' + cfg.id);
      mainButton.html(cfg.name);
      mainButton.click(selectPage.bind(this, cfg.id));

      // Setup button
      interfaceDelete.click(function() {
        if(sidebarButton.hasClass('delete')) {
          deletePage(cfg.id, {
            container: container,
            sidebarButton: sidebarButton,
            mainButton: mainButton
          });
        }
        else {
          sidebarButton.addClass('delete');
        }
      });
      $(document).click(function(event) {
        if(!$(event.target).is(interfaceDelete)) {
          sidebarButton.removeClass('delete');
        }
      });

      // Reset form
      newPageForm.find('input').val('');

      if(cfg.animate) {
        newPageForm.hide();
        // Expand container
        container.animate({
          height: container.height() + newPageForm.height()
        }, 500, function() {
          // Fade form in
          newPageForm.fadeIn(500, function() {
            // Create button in main page
            pageTabs.append(mainButton);
          });
        });  
      }
      else {
        pageTabs.append(mainButton);
      }
    };

    // Delete a new page
    // INPUT: Page ID and divs to update (pages drawer and buttons)
    var deletePage = function deletePage(id, divs) {
      Weebly._delete({
        url: Weebly.url('page', id)
      });

      divs.container.css('height', 'auto');
      divs.sidebarButton.css('visibility', 'hidden');
      divs.sidebarButton.slideUp(500, function() {
        divs.mainButton.fadeOut(250, function() {
          // Remove page from array
          for(var i = 0; i < pages.length; i ++) {
            if(pages[i].id === id) {
              pages.splice(i, 1);
            }
          }
          if(selectedPage === id) {
            selectPage(pages[0].id);
          }

          divs.mainButton.remove();
        });
      });
    };

    // Select a specific page and load its content
    var selectPage = function selectPage(id) {
      if(selectedPage !== id) {
        $('.page-button').removeClass('selected');
        $('.page-' + id).addClass('selected');

        selectedPage = id;

        if(pageCache[id]) {
          buildPage();
        }
        else {
          Weebly.get({
            url: Weebly.url('page', id),
          })
          .done(function(data) {;
            data.config = JSON.parse(data.config.replace(/\n/g, '\\n'));
            pageCache[id] = data;
            buildPage();
          });
        }
      }
    };

    var buildPage = function buildPage(page) {
      if(!page) {
        page = pageCache[selectedPage];
      }

      currentPage = [];
      page.config.forEach(function(element) {
        currentPage.push(Weebly.element(element));
      });

      // Create DOM
      pageContainer.empty();
      currentPage.forEach(function(element) {
        pageContainer.append(element.container);

        initElement(element);
      });
    };

    var initElement = function(element) {
      element.init();
      element.container.click(editElement.bind(this, element));
      if(element._delete.button) {
        element._delete.button.click(function() {
          if(element._delete.trigger()) {
            // if it returns true: actually delete element
            currentPage.splice(currentPage.indexOf(element), 1);
            element.container.fadeOut(function() {
              element.container.remove();
            });

            savePage();
          }
        });
      }
      $(document).click(function(e) {
        if($(e.target).closest(element.container).length === 0) {
          if(element.editing) {
            element.editing = false;
            element._delete.cancel();
            element.finalize();
            savePage(); 
          }
        }
      });
    };

    var editElement = function (element) {
      var needsSave = false;
      currentPage.forEach(function(other) {
        if(other.editing) {
          other.editing = false;
          other.finalize();
          needsSave = true;
        }
      });

      if(needsSave) {
        savePage(); 
      }

      element.editing = true;
      element.edit();
    }

    var elements;
    // Show where an element belongs in the page
    Weebly.showElementPlace = function(loc) {
      $('.page-element').removeClass('border-top border-bottom');

      var pageOffset = pageContainer.offset();
      if(loc.x < pageOffset.left || loc.y < pageOffset.top){
        return;
      }

      var ndx;
      for(ndx = 0; ndx < currentPage.length; ndx ++) {
        var elemOffset = currentPage[ndx].container.offset();
        var elemHalfHeight = currentPage[ndx].container.height() / 2;
        if(loc.y <= elemOffset.top + elemHalfHeight) {
          currentPage[ndx].container.addClass('border-top');
          return;
        }
      }
      // Nothing picked, we're below the page
      currentPage[ndx - 1].container.addClass('border-bottom');
    };

    // Place an element in the page
    Weebly.placeElement = function(cfg) {
      $('.page-element').removeClass('border-top border-bottom');

      var pageOffset = pageContainer.offset();
      if(cfg.x < pageOffset.left || cfg.y < pageOffset.top){
        return;
      }

      var ndx;
      for(ndx = 0; ndx < currentPage.length; ndx ++) {
        var elemOffset = currentPage[ndx].container.offset();
        var elemHalfHeight = currentPage[ndx].container.height() / 2;
        if(cfg.y <= elemOffset.top + elemHalfHeight) {
          // Only add before me if possible
          if(currentPage[ndx].container.hasClass('dynamic') ||
             ndx > 0 && currentPage[ndx - 1].container.hasClass('dynamic')) {
            var newElement = Weebly.element({
              type: cfg.element.attr('element-type')
            });

            newElement.container.insertBefore(currentPage[ndx].container);
            currentPage.splice(ndx, 0, newElement);

            initElement(newElement);
            editElement(newElement);
          }
          return;
        }
      }

      // Nothing picked, we're below the page
      var newElement = Weebly.element({
        type: cfg.element.attr('element-type')
      });

      pageContainer.append(newElement.container);
      currentPage.push(newElement);

      initElement(newElement);
      editElement(newElement);
    };
  });
})();