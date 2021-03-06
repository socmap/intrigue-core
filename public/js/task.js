(function($) {
  "use strict";

  function prepTaskRunner(data) {
    // http://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
    if (typeof location.origin === 'undefined') {
      location.origin = location.protocol + '//' + location.host;
    }

    $.getJSON(location.origin + "/v1/tasks.json", function(data) {
      parseTasks(data);

      // get the specific task data and set the allowed entity types
      var form = $("form")[0]
      var task_name = form.task_name.value

      // get the specific task JSON and set the allowed / default fields
      var form = $("form")[0]
      var attrib_name = form.attrib_name.value
      $.getJSON(location.origin + "/v1/tasks/" + task_name + ".json", function(data) {
        if (!(window.location.href.indexOf("entity_id=") > -1) ||
            !(window.location.href.indexOf("task_result_id=") > -1) ||
            !(window.location.href.indexOf("entities") > -1)) {
          // This is a form that doesn't have an entity already filled out, let's provide an example
          parseAllowedEntityTypes(data);
          setDefaultEntity(data);
        }
        else {
          //Disabling form since we're on a pre-populated form
          $('#attrib_name').attr('readonly', true);
          $('#entity_type').attr('readonly', true);
        }

        // set the description
        $('#description').html("Description: ")
        $('#description').append(data["description"]);

        // set the references
        $('#links').html("References:<ul>");
        $.each(data["references"], function(id,value) {
          var link_string = "<li><a href=\"" + value + "\">" + value.substring(0,30) + "...</a></li>";
          $('#links').append(link_string);

        });
        $('#links').append("</ul>");
      });
    });
  }

  function setDefaultEntity(data) {
    //console.log(data);
    var entity_type = data["example_entities"][0]["type"];
    var entity_name = data["example_entities"][0]["attributes"]["name"]

    console.log("DEBUG: Setting name to " + entity_name);
    console.log("DEBUG: Setting type to " + entity_type);

    // set the name
    $("#attrib_name").attr("value", entity_name);

    // set the type
    $("#entity_type option[value=\""+entity_type+"\"]").prop('selected', true);
    //$("#entity_type option[value=\""+"String"+"\"]").prop('selected', true);

  }

  /* -------------------------------------------------------------------------- */

    function parseAllowedEntityTypes(task_hash) {
      // Clear entity type
      $('#entity_type').empty()

      // Check to see if we have a *
      if (task_hash["allowed_types"].indexOf("*") != -1) {
        // get the full entity_types.json
        $.getJSON(location.origin + "/v1/entity_types.json", function(data) {
          $.each(data, function(key, value) {
            $('#entity_type')
               .append($("<option></option>")
               .attr("value",value)
               .text(value));
            });
        });

      }
      else {
        // Set the values based on just this task's allowed type
        $.each(task_hash["allowed_types"], function(key, value) {
          $('#entity_type')
             .append($("<option></option>")
             .attr("value",value)
             .text(value));
          });
      }
    }

  /* -------------------------------------------------------------------------- */

    function parseTasks(tasks_hash) {
      var task_count = tasks_hash.length;
      var metadata = $("#metadata");

      $.each(tasks_hash, function(index, value) {
        var entity_type, entity_name, form = $("form")[0];
        if (value.name === form.task_name.value) {
          // get values, so we can check if they exist
          //entity_type = form.entity_type.value;
          //entity_name = form.attrib_name.value;

          // if we don't have a set type
          //if (!window.location.href.indexOf("entity_id=")[1] && !window.location.href.indexOf("task_result_id=")[1] && !!window.location.href.indexOf("entities")[1]) {
          //  form.entity_type.value = value.example_entities[0].type;
          //  form.attrib_name.value = value.example_entities[0].attributes.name;
          //}

          //metadata.html(
          //  "<pre><code class='json'>" +
          //  JSON.stringify(value, null, 2) +
          //  "</code></pre>"
          //);

          setOptions(value.allowed_options);
        }
      });

      //highlightCode();
    }

  /* -------------------------------------------------------------------------- */

  function setOptions(options) {
    var option_html = "";
    $( "#options" ).empty();

    $.each(options, function(index, value) {
      option_html += [
        '<div class="form-group">',
          '<label class="col-xs-4 control-label" for="' + value.name + '">',
            value.name,
          '</label>',
          '<div class="col-xs-6">',
          '<input id="' + value.name + '" class="form-control input-sm" type="text" value="'
          + value.default + '" name="option_' + value.name + '"></input>',
          '</div>',
        '</div>'
      ].join('');
    });

    // Only show 'Option' fields if applicable
    if (option_html) {
      $( "#options" ).html(option_html);
    }
  }

  /* -------------------------------------------------------------------------- */

  // Update the form on load
  $("document").ready( function() {prepTaskRunner()});

  // Update the form on task change
  $("#task_name").on("change", prepTaskRunner);

  }(jQuery));
