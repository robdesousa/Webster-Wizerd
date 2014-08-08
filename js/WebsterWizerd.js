//        __     _____       _ __  _                               __
//   ____/ /__  / __(_)___  (_) /_(_)___  ____     _________  ____/ /__
//  / __  / _ \/ /_/ / __ \/ / __/ / __ \/ __ \   / ___/ __ \/ __  / _ \
// / /_/ /  __/ __/ / / / / / /_/ / /_/ / / / /  / /__/ /_/ / /_/ /  __/
// \__,_/\___/_/ /_/_/ /_/_/\__/_/\____/_/ /_/   \___/\____/\__,_/\___/

function WebsterWizerd(dictionary_key, thesaurus_key) {
    // this.url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/";
    this.dictionary_url = "/dictionary/";
    this.dictionary_key = dictionary_key;
    this.thesaurus_url = "/thesaurus/";
    this.thesaurus_key = thesaurus_key;
    this.handleEvents();
    console.log("You're a Wizerd, 'Harry!");
}

// gets the definition XML over the network ($.get())
// example url: http://www.dictionaryapi.com/api/v1/references/collegiate/xml/wizard?key=8af24765-6a55-49b7-bec0-e84f6dc7a277
WebsterWizerd.prototype.getDefinition = function(word) {
    var dictionary_url_array = [
        this.dictionary_url,
        word,
        '/',
        this.dictionary_key
    ];

    var dict_url = (dictionary_url_array.join(''));
    return $.get(dict_url).then(
        function(xml) {
            return xmlToJson(xml); // whatever I return here
        }
    );
}

WebsterWizerd.prototype.getThesaurus = function(word) {
    var thesaurus_url_array = [
        this.thesaurus_url,
        word,
        '/',
        this.thesaurus_key
    ];

    var thes_url = (thesaurus_url_array.join(''));
    return $.get(thes_url).then(
        function(xml) {
            return xmlToJson(xml);
        }
    );
}

// showResults() is a prototype function which:
//
// - accepts a single argument, the word to search for, and passes it to our data requests
// - loads templates and data for dictionary and thesaurus APIs
// - places resulting elements on the DOM
WebsterWizerd.prototype.showResults = function(word) {
    //- $.when is a promise statement that collects the data as promise objects
    // - promise objects don't return in the same order
    // - If a promise object doesn't resolve, $.then() doesn't run
    // - $.when() collects and .then() processes them
    // - jQuery passes the promise objects in order to the function in line 76
    $.when(
        this.getDefinition(word),
        this.getTemplate('./templates/dictionary-definition.html'),
        this.getThesaurus(word),
        this.getTemplate('./templates/thesaurus-synonyms.html')
    ).then(
        //-After the promises are successfully passed to $.then(), it pipes the results to the function on line 76
        //-The function is passed 4 objects; 1 dictionary data, 1 thesaurus data, and a template for each
        //

        function(definitionData, dictionaryTemplateResults, thesaurusData, synonymTemplateResults) {

            // blindly grab the first definition entry
            var definitionEntry = definitionData.entry_list.entry[0];
            // matches every item in the thesaurus to the definition entry,
            // comparing the word type or functional use (a.k.a. "noun")
            // stores result as an array
            var thesaurusEntries = _.filter(thesaurusData.entry_list.entry, function(entry) {
                return entry.fl['#text'] === definitionEntry.fl['#text'];
            });
            // select first filtered item, or set as undefined
            var thesaurusEntry = thesaurusEntries[0];

            // create JS template functions from HTML
            var templatingFunctionDictionary = _.template(dictionaryTemplateResults);
            var templatingFunctionThesaurus = _.template(synonymTemplateResults);

            // find .dictionary-destination in HTML and use dictionary template
            // and data to write presentation to DOM
            $('.dictionary-destination').html(
                templatingFunctionDictionary(definitionEntry)
            );

            // find .thesaurus-destination in HTML and write thesaurus template
            // and data to write presentation to DOM,
            // and if no thesaurus data, clear the container
            if (thesaurusEntry) {
                $('.thesaurus-destination').html(
                    templatingFunctionThesaurus(thesaurusEntry)
                );
            } else {
                $('.thesaurus-destination').html('');
            }

        }
    )
}

// function to retrieve the template
WebsterWizerd.prototype.getTemplate = function(template_url) {
    return $.get(template_url).then(
        function(html) {
            return html;
        }
    );
    //template = _.template('./templates/dictionary-definition.html');
}

// event listener
WebsterWizerd.prototype.handleEvents = function() {
    var self = this;
    var charlie = document.querySelector('#charlie');

    $('.container').on('click', '.sound-button', function() {
        var prefix = "http://media.merriam-webster.com/soundc11/";
        var url = this.getAttribute("url");
        var audio_url = prefix + url.charAt(0) + '/' + url;

        // create an audio tag
        var tag = document.createElement('audio');
        tag.src = audio_url;
        tag.play();
    })
}

//     ____              __
//    / __ \____  __  __/ /____  _____
//   / /_/ / __ \/ / / / __/ _ \/ ___/
//  / _, _/ /_/ / /_/ / /_/  __/ /
// /_/ |_|\____/\__,_/\__/\___/_/

// Backbone lingo for starting our router function
var Router = Backbone.Router.extend({
    // a new instance of 'wizerd' is created
    wizerd: new WebsterWizerd(
        '8af24765-6a55-49b7-bec0-e84f6dc7a277',
        '070ba04d-4a8a-4e5b-be08-218c72522083'
    ),
    // create a routes object with a route parameter (from our url)
    routes: {
        ":something": "search"
    },
    // function that takes the route parameter and passes it to showResults
    search: function(word) {
        this.wizerd.showResults(word);
    }
});



//     ____             __   __                              _
//    / __ )____ ______/ /__/ /_  ____  ____  ___     _   __(_)__ _      _______
//   / __  / __ `/ ___/ //_/ __ \/ __ \/ __ \/ _ \   | | / / / _ \ | /| / / ___/
//  / /_/ / /_/ / /__/ ,< / /_/ / /_/ / / / /  __/   | |/ / /  __/ |/ |/ (__  )
// /_____/\__,_/\___/_/|_/_.___/\____/_/ /_/\___/    |___/_/\___/|__/|__/____/

// backbone lingo to start our view function
var HeaderView = Backbone.View.extend({
    // locating .header element in DOM
    el: document.querySelector('.header'),
    // handle "form submit" event, calls search function
    events: {
        "submit form": "search",
    },
    // 1) stop refreshing the page,
    // 2) look for the specific 'input' element inside this view,
    // 3) if the input is not empty, change the hash route
    search: function(event) {
        event.preventDefault();
        var input = this.el.querySelector('input');
        if (input.value !== "") {
            window.location.hash = '#' + input.value;
        }
    }
});


//                              __  _                               __
//   ___  _  _____  _______  __/ /_(_)___  ____     _________  ____/ /__
//  / _ \| |/_/ _ \/ ___/ / / / __/ / __ \/ __ \   / ___/ __ \/ __  / _ \
// /  __/>  </  __/ /__/ /_/ / /_/ / /_/ / / / /  / /__/ /_/ / /_/ /  __/
// \___/_/|_|\___/\___/\__,_/\__/_/\____/_/ /_/   \___/\____/\__,_/\___/


window.onload = app;

function app() {

    myHeaderView = new HeaderView();

    var myRouter = new Router();
    if (!Backbone.history.start()) {
        myRouter.navigate("magic", {
            trigger: true
        });
    }
}