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
        if(location.pathname.indexOf('/page/') !== -1)
          selectPage(parseInt(location.pathname.substr(6), 10));
        else
          selectPage(pages[0].id);
      });

      window.addEventListener('popstate', function(e) {
        if(location.pathname.indexOf('/page/') !== -1)
          selectPage(parseInt(location.pathname.substr(6), 10));
      });
    });

    // Add a new page from the form
    var newPageForm = $('form');
    newPageForm.submit(function(event) {
      var formData = newPageForm.serializeArray()[0];
      var data = {};
      data[formData.name] = formData.value;
      data.config = "[[{\"type\":\"image\",\"fixed\":\"true\"}],[{\"type\":\"title\",\"text\":\"Add title here\",\"fixed\":\"true\"}]]";

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

    var savePage = Weebly.savePage = function savePage() {
      var page = [];
      currentPage.forEach(function(row) {
        var rowConfig = [];
        row.forEach(function(element) {
          var val = element.val();
          if(val)
            rowConfig.push(val);
        });
        page.push(rowConfig);
      });

      Weebly.put({
        url: Weebly.url('page', selectedPage),
        data: {
          config: page
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

      interfaceEdit.click(selectPage.bind(this, cfg.id));

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
          })
          .error(function(data) {
            if(data.status === 404) {
              history.replaceState('Page ' + pages[0].id, 'Weebly', '/page/' + pages[0].id);
              selectPage(pages[0].id);
            }
          });
        }

        if(location.pathname !== '/page/' + id)
          history.pushState('Page ' + id, 'Weebly', '/page/' + id);
      }
    };

    var buildPage = function buildPage(page) {
      if(!page) {
        page = pageCache[selectedPage];
      }

      currentPage = [];
      page.config.forEach(function(rowConfig) {
        var row = [];
        rowConfig.forEach(function(element) {
          row.push(Weebly.element(element));
        });
        if(row.length > 0)
          currentPage.push(row);
      });

      // Create DOM
      var elToInit = [];
      pageContainer.empty();
      currentPage.forEach(function(row) {
        var rowContainer = $('<div class="page-row"></div>');
        row.forEach(function(element) {
          rowContainer.append(element.container);

          elToInit.push(element);
        });
        pageContainer.append(rowContainer);
      });

      elToInit.forEach(function(el) { initElement(el); });
    };

    var initElement = function(element) {
      element.init();
      Weebly.Draggable(element.container, moveElement.bind(element));
      element.container.click(editElement.bind(this, element));
      if(element._delete.button) {
        element._delete.button.click(function() {
          if(element._delete.trigger()) {
            // if it returns true: actually delete element
            var rowIndex = element.container.parent().index();
            if(element.container.parent().children().length === 1) {
              currentPage.splice(rowIndex, 1);
              element.container.parent().fadeOut(function() {
                element.container.parent().remove();
              });
            }
            else {
              currentPage[rowIndex].splice(element.container.index(), 1);
              element.container.fadeOut(function() {
                element.container.remove();
              });
            }

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
            element.container.attr('no-drag', 'false');
            savePage(); 
          }
        }
      });
    };

    Weebly.finalizeAll = function() {
      var needsSave = false;
      currentPage.forEach(function(row) {
        row.forEach(function(other) {
          if(other.editing) {
            other.editing = false;
            other.finalize();
            other.container.attr('no-drag', 'false');
            needsSave = true;
          }
        });
      });

      if(needsSave) {
        savePage(); 
      }
    };

    var editElement = function (element) {
      Weebly.finalizeAll();

      element.container.attr('no-drag', 'true');
      element.editing = true;
      element.edit();
    };

    var findElementPlace = function(loc) {
      $('.page-row, .page-element').removeClass('border-top border-bottom border-right');
      $('#placeholder').remove();

      var pageOffset = pageContainer.offset();
      if(loc.x < pageOffset.left || loc.y < pageOffset.top){
        return false;
      }

      var rows = $('.page-row');
      for(var i = 0; i < rows.length; i ++) {
        row = $(rows[i]);
        var offset = row.offset();
        var height = row.height();

        if(loc.y <= offset.top + 10) {
          return { ndx: i, newRow: true, appendBefore: row };
        }
        else if(loc.y <= offset.top + height - 10) {
          var ndx = [i, 0];
          var appendAfter;

          var children = row.children();
          for(var child = 0; child < children.length; child ++) {
            var childEl = $(children[child]);
            if(loc.x > childEl.offset().left + childEl.width() / 2) {
              ndx[1] = child + 1;
              appendAfter = childEl;
            }
          }

          return { ndx: ndx, newRow: false, appendAfter: appendAfter };
        }
      }
      return { ndx: i, newRow: true, appendAfter: rows.last() };
    };

    // Show where an element belongs in the page
    Weebly.showElementPlace = function(loc) {
      var row = findElementPlace(loc);
      if(row === false)
        return;
      else if(row.newRow) {
        if(row.appendBefore)
          row.appendBefore.addClass('border-top');
        else // Nothing picked, we're below the pag
          row.appendAfter.addClass('border-bottom');
      }
      else if(row.appendAfter) {
        row.appendAfter.addClass('border-right');
        var placeholder = $('<div id="placeholder" class="page-element"></div>');
        placeholder.insertAfter(row.appendAfter);
      }
    };

    // Place an element in the page
    Weebly.placeNewElement = function(cfg) {
      var row = findElementPlace(cfg);
      if(row === false)
        return;
      else {
        var newElement = Weebly.element({
          type: cfg.element.attr('element-type')
        });

        var container = newElement.container;
        if(row.newRow) {
          container = $('<div class="page-row"></div>');
          container.append(newElement.container);

          if(row.appendBefore) {
            container.insertBefore(row.appendBefore);
            currentPage.splice(row.ndx, 0, [newElement]);
          }
          else { // Nothing picked, we're below the page
            pageContainer.append(container);
            currentPage.push([newElement]);
          }
        }
        else {
          container.insertAfter(row.appendAfter);
          currentPage[row.ndx[0]].splice(row.ndx[1], 0, newElement);
        }

        initElement(newElement);
        editElement(newElement);
        savePage();
      }
    };

    var moveElement = function (loc, element) {
      var lastRowIndex = this.container.parent().index();
      var row = findElementPlace(loc);

      if(row === false)
        return;
      else {
        var parentRow = this.container.parent();
        if(row.newRow) {
          if(parentRow.children().length === 1 &&
            (row.appendBefore && row.appendBefore.index() === parentRow.index()
            || row.appendAfter && row.appendAfter.index() === parentRow.index()))
            return;
        }
        else {
          if(!row.appendAfter && this.container.index() === 0
            || row.ndx[1] - 1 === this.container.index() && parentRow.index() === row.ndx[0])
            return;

        }

        if(parentRow.children().length > 1) {
          // We're not the only ones in this row - move just me
          currentPage[lastRowIndex].splice(this.container.index(), 1);
          this.container.remove();
        }
        else {
          // Remove the whole row
          parentRow.remove();
          currentPage.splice(lastRowIndex, 1);

          if(typeof(row.ndx) === 'number' && row.ndx > lastRowIndex) row.ndx --;
          if(typeof(row.ndx) === 'object' && row.ndx[0] > lastRowIndex) row.ndx[0] --;
        }

        var container = this.container;
        if(row.newRow) {
          container = $('<div class="page-row"></div>');
          container.append(this.container);
        
          if(row.appendBefore) {
            container.insertBefore(row.appendBefore);
            currentPage.splice(row.ndx, 0, [this]);
          }
          else {
            container.insertAfter(row.appendAfter);
            currentPage.push([this]);
          }
        }
        else {
          if(row.appendAfter) {
            this.container.insertAfter(row.appendAfter);
          }
          else {
            $('.page-row').eq(row.ndx[0]).prepend(this.container);
          }
          currentPage[row.ndx[0]].splice(row.ndx[1], 0, this);
        }

        initElement(this);
        savePage();
      }
    };
  });
})();