jQuery API Search
=================
The jQuery API Search is a JSONP API for searching the jQuery documentation at http://api.jquery.com/. It allows users from any site to access the documentation and display as much or as little of it as desired.

URL
---
http://api.jquery.com/jsonp/

Example
-------
Find all methods in the API that have "ajax" somewhere in their title and append a link for each to the document body.
      
      $.ajax({
        url: 'http://api.jquery.com/jsonp/',
        dataType: 'jsonp',
        data: {title: 'ajax'},
        success: function(json) {
          $.each(json, function(i, val) {
            $('<a/>', {
              href: val.url,
              html: val.title,
            }).appendTo('body');
          });
        }
      });

Search Types
------------

**All searches are case-insensitive.**

* Search by name:

    * **Key**: title
    * **Value**: the name of any jQuery method, property, or selector
    * **Searches in**: post title and post slug
    * **Substitutions**: Before querying the database, all "$" are converted to "jQuery" and each instance of one or more spaces is converted to a hyphen ("-")
    * **Default**: all titles


* Search by category name

    * **Key**: category
    * **Value**: category name
    * **Substitutions**: Before querying the database, each instance of one or more spaces is converted to a hyphen ("-")
    * **Searches in**: category slug
    * **Default**: all categories
  
* Search by version number

    * **Key**: version
    * **Value**: a jQuery version number
    * **Searches** in: category slug for all categories that are a child of the main "version" category
    * **Default**: all versions

String Matching
---------------

* **Key**: match
* **Value**: one of "start", "end", or "exact" (for search by version number, one of "end" or "exact")
* **Default**: anywhere, except for version number, which has a default of start

Returned Data
-------------
Data is returned as an array of objects. Each item in the array is an object representing a single method, property, or selector. This object comes with the following structure:

      {
        "url": "...",
        "title": "...",
        "type": "...", // "method", "property", or "selector"
        "signatures": [
          {
            "added":"...",
            "params": [
              {
                "name": "...",
                "type": "...",
                "optional": "...", // either "true" or an empty string
                "desc": "..." // description of the parameter
              }
            ]
          }
        ],
        "desc": "...", // short description
        "longdesc": "...",
        "return":"..." // type of return value
      }