//        __     _____       _ __  _                               __
//   ____/ /__  / __(_)___  (_) /_(_)___  ____     _________  ____/ /__
//  / __  / _ \/ /_/ / __ \/ / __/ / __ \/ __ \   / ___/ __ \/ __  / _ \
// / /_/ /  __/ __/ / / / / / /_/ / /_/ / / / /  / /__/ /_/ / /_/ /  __/
// \__,_/\___/_/ /_/_/ /_/_/\__/_/\____/_/ /_/   \___/\____/\__,_/\___/

function WebsterWizerd(dictionary_key) {
    // this.url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/";
    this.url = "/dictionary/";
    this.dictionary_key = dictionary_key;
    this.handleEvents();
    console.log("You're a Wizerd, 'arry!");
}

// gets the definition XML over the network ($.get())
// example url: http://www.dictionaryapi.com/api/v1/references/collegiate/xml/wizard?key=8af24765-6a55-49b7-bec0-e84f6dc7a277
WebsterWizerd.prototype.getDefinition = function(word) {
    var url_array = [
        this.url,
        word,
        // "?key=",
        '/',
        this.dictionary_key
    ];

    var url = (url_array.join(''));
    return $.get(url).then(
        function(xml) {
            return xmlToJson(xml); // whatever I return here
        }
    );
}

// put the definition template and data onto the page
WebsterWizerd.prototype.showDefinition = function(word) {
    $.when(
        this.getDefinition(word),
        this.getTemplate('...')
    ).then(
        function(xmlData, templateResults) { // is passed to here
        	var entry = xmlData.entry_list.entry[0];
            console.log(entry);
            ///... combine HTML and templates
            var templatingFunction = _.template(templateResults);
            $('.template-destination').html(
                templatingFunction(entry)
            );
        }
    )
}

// function to retrieve the template
WebsterWizerd.prototype.getTemplate = function() {
    return $.get('./templates/dictionary-definition.html').then(
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

	$('.container').on('submit', 'form', function(event){
		event.preventDefault();
		if(charlie.value === "") {
			alert("NO CHARLES NO");
			return;
		}
		self.showDefinition( charlie.value )
	})

	$('.container').on('click', '.sound-button', function(){
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
    var dictionary_key = '8af24765-6a55-49b7-bec0-e84f6dc7a277';
    wizerd = new WebsterWizerd(dictionary_key);
}
