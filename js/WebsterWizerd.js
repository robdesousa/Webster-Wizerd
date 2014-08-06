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

// put the definition template and data onto the page
WebsterWizerd.prototype.showResults = function(word) {
    $.when(
        this.getDefinition(word),
        this.getTemplate('./templates/dictionary-definition.html'),
        this.getThesaurus(word),
        this.getTemplate('./templates/thesaurus-synonyms.html')
    ).then(
        function(definitionData, dictionaryTemplateResults, thesaurusData, synonymTemplateResults) { // is passed to here

            var definitionEntry = definitionData.entry_list.entry[0];
            var thesaurusEntry = _.filter(thesaurusData.entry_list.entry, function(entry) {
                return entry.fl['#text'] === definitionEntry.fl['#text'];
            })

            // console.log(JSON.stringify(thesaurusEntry));

            ///... combine HTML and templates
            var templatingFunctionDictionary = _.template(dictionaryTemplateResults);
            var templatingFunctionThesaurus = _.template(synonymTemplateResults);

            $('.dictionary-destination').html(
                templatingFunctionDictionary(definitionEntry)
            );

            if (thesaurusEntry.length) {
                $('.thesaurus-destination').html(
                    templatingFunctionThesaurus(thesaurusEntry[0])
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

    $('.container').on('submit', 'form', function(event) {
        event.preventDefault();
        // console.log(charlie.value, charlie.value.toLowerCase());
        if (charlie.value === "" ) {
            alert("Either Capitalized Letters or No Letter Entered!");
            return;
        }
        self.showResults(charlie.value.toLowerCase());
    })
 
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


//                              __  _                               __
//   ___  _  _____  _______  __/ /_(_)___  ____     _________  ____/ /__
//  / _ \| |/_/ _ \/ ___/ / / / __/ / __ \/ __ \   / ___/ __ \/ __  / _ \
// /  __/>  </  __/ /__/ /_/ / /_/ / /_/ / / / /  / /__/ /_/ / /_/ /  __/
// \___/_/|_|\___/\___/\__,_/\__/_/\____/_/ /_/   \___/\____/\__,_/\___/


window.onload = app;

function app() {
    var thesaurus_key = '070ba04d-4a8a-4e5b-be08-218c72522083';
    var dictionary_key = '8af24765-6a55-49b7-bec0-e84f6dc7a277';
    wizerd = new WebsterWizerd(dictionary_key, thesaurus_key);
}
