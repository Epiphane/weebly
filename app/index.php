<!doctype html>
<html class="no-js">
  <head>
    <meta charset="utf-8">
    <title>Code</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width">
    <link rel="shortcut icon" href="/favicon.ico">
    <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
    <!-- build:css(.) styles/vendor.css -->
    <!-- bower:css -->
    <!-- endbower -->
    <!-- endbuild -->
    <!-- build:css(.tmp) styles/main.css -->
    <link rel="stylesheet" href="/weebly/styles/main.css">
    <!-- endbuild -->
  </head>
  <body>
    <!--[if lt IE 10]>
      <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
    <![endif]-->
    <div id="title-bar">
      <img class="weebly-logo" src="/weebly/weebly_assets/sprites/Weebly-Logo.png" />
    </div>

    <div class="container">

      <div id="page-drawer">
        <div class="header">
          Templates
        </div>
        <div class="section full-width">
          <div class="container">
            <div class="button primary">
              Page
            </div>
            <form class="input-with-icon" method="POST">
              <input id="new-page" name="page-name" type="text" class="button tertiary with-icon" placeholder="Add new page" />
              <input type="submit" class="pull-right weebly-icon add fade focus-blue" data-control="new-page" />
            </form>
          </div>
        </div>

        <div class="header">
          Elements
        </div>
        <div>
          <div class="section half-width clickable">
            <div class="element container skinny">
              <div class="weebly-icon element title"></div>
              <p><a>Title</a></p>
            </div>
          </div>
          <div class="section half-width clickable">
            <div class="element container skinny">
              <div class="weebly-icon element text"></div>
              <p><a>Text</a></p>
            </div>
          </div>
          <div class="section half-width clickable">
            <div class="element container skinny">
              <div class="weebly-icon element image"></div>
              <p><a>Image</a></p>
            </div>
          </div>
          <div class="section half-width clickable">
            <div class="element container skinny">
              <div class="weebly-icon element nav"></div>
              <p><a>Nav</a></p>
            </div>
          </div>
        </div>

        <div class="header">
          Settings
        </div>
        <div class="section half-width">
          <div class="element container settings-row">
            <p>Site Grid</p>
          </div>
        </div>
        <div class="section half-width">
          <div class="element container settings-row">
            <div class="checkbox-slider center">
              <input type="checkbox" value="1" id="checkboxThreeInput" name="" />
              <label for="checkboxThreeInput"></label>
            </div>
          </div>
        </div>
      </div>

      <div id="page-container">
        <a class="button secondary">Page</a>
      </div>s

    </div>

    <!-- build:js(.) scripts/vendor.js -->
    <!-- bower:js -->
    <script src="/bower_components/jquery/dist/jquery.js"></script>
    <!-- endbower -->
    <!-- endbuild -->

    <!-- build:js({app,.tmp}) scripts/main.js -->
    <script src="scripts/main.js"></script>
    <!-- endbuild -->
</body>
</html>
