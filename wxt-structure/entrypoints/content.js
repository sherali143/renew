export default defineContentScript({
  matches: ['<all_urls>'],
  main() {

    // creating a shadow host to render our extension UI separately from the rest of document/news site. This helps in resolving styling conflicts
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM
    const shadowhost = document.createElement('div');


    // Using a global reference for the URL: https://www.nationalreview.com/  
    const NATIONAL_REVIEW_URL = 'https://www.nationalreview.com';


    // Moving .article-content.article-content--headless to a global constant
    const NATIONAL_REVIEW_SELECTOR = '.article-content.article-content--headless';


    // URL Patterns for supported sites by our extension
    const URL = [
      /^https:\/\/www\.bbc\.com(\/(?!live\/|topics\/)[\w-]+){3}$/,                                                //  BBC                                    (working)
      /^https:\/\/www\.bbc\.com(\/(?!live\/|topics\/)[\w-]+){4}$/,                                                //  BBC Sports                             (working)
      /^https:\/\/edition\.cnn\.com\/\d{4}\/\d{2}\/\d{2}\/[\w-]+\/[\w-]+\/index\.html$/,                          //  CNN                                    (working)  
      /^https:\/\/edition\.cnn\.com\/\w+\/[\w-]+(?:\/index\.html)?$/,                                             //  CNN                                    (working)
      /^https:\/\/www\.foxnews\.com(\/(?!live-news\/)[\w-]+){2,}$/,                                               //  Fox news                               (working)
      /^https:\/\/nypost\.com\/\d{4}\/\d{2}\/\d{2}\/[\w-]+(\/[\w-]+)*\/?$/,                                       //  nypost                                 (working)
      /^https:\/\/www\.dailywire\.com\/news\/[\w\-']+(\?[\w\-]+=[\w\d\-]+(&[\w\-]+=[\w\d\-]+)*)?$/,               //  Daily Wire                             (working)
      /^https:\/\/www\.thedailybeast\.com\/[\w-]+(\/)?(\?[\w-]+(=[\w-]+)?(&[\w-]+(=[\w-]+)?)*)?$/,                //  Daily Beast                            (working)
      /^https:\/\/apnews\.com\/article\/[\w-]+-\w{32}$/,                                                          //  AP News                                (working)
      /^https:\/\/www\.vox\.com\/[\w-]+\/\d+\/[\w-]+(?:\/[\w-]+)*$/,                                              //  VOX                                    (working)
      /^https:\/\/www\.newsweek\.com\/[\w-]+-\d+$/,                                                               //  News Week                              (working)
      /^https:\/\/thehill\.com\/(?:[\w-]+\/)*\d{7}-[\w-]+\/?(\?.*)?$/,                                            //  The Hill News                          (working)
      /^https:\/\/www\.geo\.tv\/latest\/\d{6}-[\w-]+$/,                                                           //  GEO News                               (working)
      /^https:\/\/arynews\.tv\/[\w-]+\/?$/,                                                                       //  ARY News                               (working)
      /^https:\/\/www\.usatoday\.com\/story\/[\w-]+\/[\w-]+\/\d{4}\/\d{2}\/\d{2}\/[\w-]+\/\d+\/?$/,               //  USA Today Sports                       (working)
      /^https:\/\/www\.usatoday\.com\/story\/[\w-]+\/[\w-]+\/[\w-]+\/\d{4}\/\d{2}\/\d{2}\/[\w-]+\/\d+\/?$/,       //  USA Today                              (working)       
      /^https:\/\/www\.usatoday\.com\/story\/(?:[\w-]+\/)?(?:[\w-]+\/)?\d{4}\/\d{2}\/\d{2}\/[\w-]+\/\d+\/?(\?.*)?$/, //USA Today                             (working)   
      /^https:\/\/www\.aljazeera\.com\/(?:news|features|economy|longform|opinions)\/\d{4}\/\d{1,2}\/\d{1,2}\/[\w-]+(?:\/[\w-]+)*$/,   //  al-jazeera         (working)
      /^https:\/\/www\.aljazeera\.com\/news\/longform\/\d{4}\/\d{1,2}\/\d{1,2}\/[\w-]+(?:\/[\w-]+)*$/,                                // al-jazeera longform (working)
      /^https:\/\/tribune\.com\.pk\/story\/\d+\/[\w-]+$/,                                                         //  Tribune                                (working)
      /^https:\/\/www\.reuters\.com\/(?:[\w-]+\/)+[\w-]+(?:\/\d{4}-\d{2}-\d{2})?\/?$/,                            //  Reuters                                (working)
      /^https:\/\/www\.nbcnews\.com\/[\w-]+\/[\w-]+\/[\w-]+-[\w-]+-\w+-rcna\d+(\?.*)?$/,                          //  NBC News                               (working)
      /^https?:\/\/(?:www\.)?nationalreview\.com\/(?:[\w-]+\/)*[\w-]+\/?(?:\?.*)?$/,                              //  National Review                        (Added Extra Working Perfect)
    ];


    // code below reloads the tab in order to run the script on single page applications
    let lastUrl = window.location.href;
    console.log(lastUrl)
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl && (currentUrl.startsWith('https://www.aljazeera.com') || currentUrl.startsWith('https://www.dailywire.com') || currentUrl.startsWith(NATIONAL_REVIEW_URL))) {
        lastUrl = currentUrl;
        console.log(`URL changed to: ${currentUrl}`);
        location.reload();
      }
    });

    // Observe changes to the DOM
    observer.observe(document, { subtree: true, childList: true });

    const currentUrl = window.location.href;                                  //get the url of the current tab
    const matchesPattern = URL.some((pattern) => pattern.test(currentUrl));   //if currentUrl matches with the URL Patterns ---it returns true or false

    // If any pattern matches a url, it means we are on a site we support. so we start to render our extension UI.
    if (matchesPattern) {

      const article = await extractArticle();

      if (article) {

        // giving shadow-host an id and appending shadowhost to the document
        shadowhost.id = 'host-shadow';
        document.body.appendChild(shadowhost)

        // attaching shadow-dom to the shadowHost
        const shadow = shadowhost.attachShadow({ mode: "open" });

        // CSS for UI of our extension
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        #error-container{
          width: 100%;
          text-align: center;
        }

        #error-container p {
          font-size: 16px;
          color: red;
          font-family: sans-serif;
          margin: 10px 0px;
        }


        /* Spinner styles */
        #loading-spinner {
          position: relative;
        }

        .spinner {
          width: 70px; /* 20 * 4 */
          height: 70px; /* 20 * 4 */
          border: 4px solid #D1D5DB; /* border-gray-300 */
          border-radius: 50%;
          border-top-color: #4B5563; /* border-t-gray-600 */
          animation: spin 1s linear infinite;
        }

        .alert-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 2s infinite;
        }

        #button-spinner {
          display: none;
          width: 10px; /* Adjust size */
          height: 10px;
          border: 3px solid #f3f3f3; 
          border-top: 3px solid #8d949d; 
          border-radius: 50%;
          animation: spin 1s linear infinite; /* Spinner animation */
          margin-left: 8px; /* Space between text and spinner */
        }

        .analyzing-text{
          font-weight: 600;
          opacity: 0.8;
          font-family: sans-serif;
          font-size: 1rem; 
          text-align: center; 
          color: #374151; 
        }

        #main-content-wrapper{
          display: flex;
          flex-direction: column; 
          flex-grow: 1; 
          justify-content: center; 
          align-items: center; 
        }

        
        /* Initially hide the bias meter and labels until the loading is done */
        #panel-content.loaded #bias-meter,
        #panel-content.loaded #bias-labels {
          display: flex;
        }

        #panel-content #bias-meter,
        #panel-content #bias-labels {
          display: none;
        }

        /* Loading spinner hidden once loaded */
        #panel-content.loaded #loading-spinner {
          display: none;
        }

        #extension-hover-panel {
          position: fixed;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          width: 320px; 
          height: 256px;
          background: linear-gradient(to bottom right, #f3f4f6, #D1D5DB);
          border-radius: 24px 0 0 24px;
          padding: 24px; 
          box-sizing: border-box;
          z-index: 2147483647;
          color: #333333;  
          font-family: sans-serif, Arial,;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
          font-size: 10.5px;
          border: 1px solid #D1D5DB;  
          border-right: none; 
          transition: right 0.5s ease-in-out;
        }

        #extension-hover-panel.minimized {
          right: -320px;
        }

        #hide-button {
          position: absolute;
          left: -25px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 30px;
          background-color: #404853;
          color: white; 
          border: 1px solid #D1D5DB;
          border-radius: 0.5rem 0 0 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
        }

        #panel-content {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        #extension-hover-panel #heading {
          text-align: center;
          display:inline-block;
          font-family: sans-serif;
          margin-bottom: 24px;
          font-size: 24px;
          line-height: 2rem;
          color: #4c5c74;  /* Darker color for the header */
          font-weight: 700; /* Medium weight for headers */
          margin: 0;
        }

        #bias-meter {
          position: relative; /* Allow positioning of inner elements */
          height: 10px;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 8px;
          margin-top:20px;
          width: 100%;
        }

        #bias-indicator {
          height: 100%;
          width: 100%; /* Full width for the container */
          background: #ffffff; /* Set a solid background color */
          position: relative; /* For positioning the center highlight */
          border-radius: 5px; /* Slightly rounded corners */
          width: 100%;
        }

        #center-indicator {
          position: absolute; /* Position it absolutely within the container */
          top: 0;
          left: 30%; /* Start at 40% */
          width: 20%; /* Width of the center indicator (from 40% to 60%) */
          background: linear-gradient(to right, #4d79ff, #800080, #ff4d4d); /* Gradient only in the center */
          height: 100%; /* Full height */
          border-radius: 5px; /* Keep rounded corners */
          
        }

        #right-indicator {
          position: absolute; /* Position it absolutely within the container */
          top: 0;
          left: 70%; /* Start at 40% */
          background: linear-gradient(to right, #800080, #ff4d4d); /* Gradient only in the center */
          height: 100%; /* Full height */
          border-radius: 5px; /* Keep rounded corners */
          
        }

        #left-indicator {
          position: absolute; /* Position it absolutely within the container */
          top: 0;
          left: 0%; /* Start at 40% */
          background: linear-gradient(to right, #4d79ff, #800080); /* Gradient only in the center */
          height: 100%; /* Full height */
          border-radius: 5px; /* Keep rounded corners */
          
        }

        #bias-labels {
          display: flex;
          justify-content: space-between;
          font-family: sans-serif, Arial, Helvetica, sans-serif;
          font-size: 12px;
          margin-bottom: 12px;
          color: #1b1b1b;  /* Darker color for better readability */
          font-weight: 500; /* Regular weight for most text */
          width: 94%;
        }
        

        #auto-neutralize-container {
          display: flex;
          font-family: sans-serif;
          justify-content: center;
          align-items: center;
          margin-top: 12px;
          flex-wrap: wrap;  /* Allow wrapping for smaller screens */
        }

        #auto-neutralize-checkbox {
          margin-right: 6px;
        }

        #extension-hover-panel label {
          font-size: 12px;  /* Slightly reduced font size */
          color: #333333;  /* Dark color for better readability */
          text-align: center;
          font-weight: 400; /* Regular weight for most text */
        }

        .button-container-nn {
          display: flex;
          justify-content: center;
        }

        #toggle-content-btn {
          width: 100%;
          padding: 10px 12px;
          background-color: #0891b2;
          border: none;  
          color: white;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 700;
          transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
        }

        #toggle-content-btn:hover {
          background-color: #155e75;  /* Darker green on hover */
          transform: translateY(-2px);
        }

        #neutralize-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 10px 12px;
          background-color: #374151;  
          color: white;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 700;
          transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
        }

        #neutralize-btn:hover {
          background-color: #1F2937;  /* Darker green on hover */
          transform: translateY(-2px);
        }


        #neutralize-btn:disabled {
          background-color: #8d949d; /* Light gray background */
          color: white; /* Gray text */
          cursor:default;
          box-shadow: none; /* Remove the shadow for a disabled look */
          pointer-events: none;
        }
        `)

        // Adding css to the shadow-dom
        shadow.adoptedStyleSheets = [sheet];

        // html for our extension hover panel
        const hoverPanel = document.createElement('div');
        hoverPanel.id = 'extension-hover-panel';

        // Hover Panel UI
        hoverPanel.innerHTML = `
        <div id="hide-button">&gt;</div>
          <div id="panel-content">
              <p id="heading">ReNews</p>
              
              <div id="main-content-wrapper">

                  <div id="loading-spinner" >
                      <div class="spinner"></div>
                      <svg class="alert-circle" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                      </svg>
                  </div>
                  <!-- <p class="analyzing-text">Analyzing potential biases...</p> -->
                  
                  
                  <div id="bias-meter">
                      <div id="bias-indicator">
                          <div id="center-indicator"></div>
                          <div id="right-indicator"></div>
                          <div id="left-indicator"></div>
                      </div>
                  </div>
                  <div id="bias-labels">
                      <span>Left&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      <span>Centre</span>
                      <span>&nbsp;Right</span>
                  </div>
                  

                  <div id='error-container' style='display: none;'>
                    <p>Analysis Failed</p>
                    <p>Something went wrong.</p>
                  </div>
                  
              </div>

              <div id="neutralize-button-container" class="button-container-nn">
              <button id="neutralize-btn" disabled>
                  <span id="button-text">Neutralize</span>
                  <span id="button-spinner" class="hidden"></span> <!-- Spinner element -->
              </button>
              </div>
              <div id="toggle-button-container" class="button-container-nn" style="display: none;">
              <button id="toggle-content-btn" >See Original</button> <!-- Initially hidden -->
              </div>
              <div id="auto-neutralize-container">
              <input type="checkbox" id="auto-neutralize-checkbox">
              <label for="auto-neutralize-checkbox">Auto Neutralize in future</label>
              </div>
          </div>
      `;

        // Add the hover panel to the shadow dom
        shadow.appendChild(hoverPanel);

        // Get Neutralize button
        const neutralizeButton = shadowhost.shadowRoot.getElementById('neutralize-btn');

        // Function to set Bias Indicator
        function setBiasLevel(leaning) {
          const indicator = shadowhost.shadowRoot.getElementById('bias-indicator');
          const centerIndicator = shadowhost.shadowRoot.getElementById('center-indicator');
          const rightIndicator = shadowhost.shadowRoot.getElementById('right-indicator')
          const leftIndicator = shadowhost.shadowRoot.getElementById('left-indicator')

          // Reset the styles
          centerIndicator.style.width = '0';      // Hide initially

          if (leaning === 'left') {
            indicator.style.width = '100%';       // Adjust for left-leaning
            leftIndicator.style.width = '30%';    // Ensure center is hidden
          } else if (leaning === 'right') {
            indicator.style.width = '100%';       // Adjust for right-leaning (40% to 100%)
            rightIndicator.style.width = '30%';   // Ensure center is hidden
          } else {
            indicator.style.width = '100%';
            centerIndicator.style.width = '40%';   // Center indicator width (40% to 60%)
          }
        }

        // Function to show loading and hide after analysis
        function showLoading() {
          const panelContent = shadowhost.shadowRoot.getElementById('panel-content');
          panelContent.classList.remove('loaded'); // Show spinner, hide content
        }

        function hideLoading() {
          const panelContent = shadowhost.shadowRoot.getElementById('panel-content');
          panelContent.classList.add('loaded'); // Hide spinner, show content
        }

        // Function to neutralize content
        function neutralizeContent() {

          console.log('neutral', neutralizeButton)
          neutralizeButton.disabled = true;
          shadowhost.shadowRoot.getElementById('button-text').textContent = 'Neutralizing...';

          // Show the loading spinner
          const buttonSpinner = shadowhost.shadowRoot.getElementById('button-spinner');
          buttonSpinner.style.display = 'inline-block'

          processNewsArticle();
        }

        // Function to toggle panel visibility
        function togglePanel(isVisible, animate = true) {
          const panel = shadowhost.shadowRoot.getElementById('extension-hover-panel');
          const hideButton = shadowhost.shadowRoot.getElementById('hide-button');

          if (isVisible) {
            panel.classList.remove('minimized');
            hideButton.textContent = '>';
          } else {
            panel.classList.add('minimized');
            hideButton.textContent = '<';
          }

          // Save the state
          chrome.storage.sync.set({ panelVisible: isVisible }, function () {
            console.log('Panel visibility state saved');
          });
        }

        // Add event listeners
        shadowhost.shadowRoot.getElementById('neutralize-btn').addEventListener('click', neutralizeContent);

        // Add event listener for checkbox
        shadowhost.shadowRoot.getElementById('auto-neutralize-checkbox').addEventListener('change', function () {
          const isChecked = this.checked;
          console.log(`Auto neutralize in future ${isChecked ? 'enabled' : 'disabled'}`);

          // Save the checkbox state
          chrome.storage.sync.set({ autoNeutralizeEnabled: isChecked }, function () {
            console.log('Auto neutralize state saved:', isChecked);
          });
        });

        let autoNeturalize = false;

        chrome.storage.sync.get(['panelVisible', 'autoNeutralizeEnabled'], async function (result) {
          const isVisible = result.panelVisible !== undefined ? result.panelVisible : true; // Default to visible if not set

          setTimeout(() => {
            togglePanel(isVisible, true)
          }, 2000)
          // togglePanel(isVisible, true); // Open without animation on initial load

          // Set the checkbox state based on the saved value (default to unchecked)
          const autoNeutralizeCheckbox = shadowhost.shadowRoot.getElementById('auto-neutralize-checkbox');
          autoNeutralizeCheckbox.checked = result.autoNeutralizeEnabled !== undefined ? result.autoNeutralizeEnabled : false;

          if (result.autoNeutralizeEnabled) {
            autoNeturalize = true;
          }

        });


        shadowhost.shadowRoot.getElementById('hide-button').addEventListener('click', function () {
          togglePanel(hoverPanel.classList.contains('minimized'), true);
        });


        const analysisResult = await analyzeArticle(article);

        hideLoading();

        console.log('analysisResult: ', analysisResult)

        setBiasLevel(analysisResult);

        if (analysisResult === 'left' || analysisResult === 'right') {

          if (autoNeturalize) {
            console.log('auto neturalize')
            neutralizeContent()
          }
          else {
            neutralizeButton.disabled = false;
          }
        }

        if (analysisResult === null) {
          shadowhost.shadowRoot.getElementById('bias-meter').style.display = 'none'
          shadowhost.shadowRoot.getElementById('bias-labels').style.display = 'none'
          shadowhost.shadowRoot.getElementById('error-container').style.display = 'block'
        }


      }
      else {
        console.log('no article')
      }

    }



    function showModal(
      message,
      showCloseButton = true // Optional close (X) button
    ) {
      const modal = document.createElement('div');
      modal.classList.add('modal');
      modal.style.display = 'flex';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      modal.style.justifyContent = 'center';
      modal.style.alignItems = 'center';
      modal.style.zIndex = '10000000';
      modal.style.transition = 'opacity 0.3s ease-in-out';

      // Modal content
      const modalContent = document.createElement('div');
      modalContent.style.backgroundColor = 'white';
      modalContent.style.borderRadius = '12px';
      modalContent.style.width = '300px';
      modalContent.style.height = '200px';
      modalContent.style.padding = '30px';
      modalContent.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3)';
      modalContent.style.position = 'relative';
      modalContent.style.display = 'flex';
      modalContent.style.flexDirection = 'column';
      modalContent.style.justifyContent = 'center';
      modalContent.style.alignItems = 'center';
      modalContent.style.textAlign = 'center';
      modalContent.style.transition = 'transform 0.3s ease-in-out';
      modalContent.style.transform = 'scale(0.9)';
      setTimeout(() => (modalContent.style.transform = 'scale(1)'), 0);

      // Modal text
      const modalText = document.createElement('h1');
      modalText.textContent = message;
      modalText.style.fontSize = '20px';
      modalText.style.lineHeight = '1.4';
      modalText.style.fontFamily = `'Poppins', sans-serif`;
      modalText.style.color = '#444';
      modalText.style.marginBottom = '15px';

      modalText.style.opacity = '0';
      modalText.style.transition = 'opacity 0.5s ease-in-out';
      setTimeout(() => (modalText.style.opacity = '1'), 100);

      modalContent.appendChild(modalText);

      // Optional close (X) button
      if (showCloseButton) {
        const closeButton = document.createElement('span');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '15px';
        closeButton.style.right = '20px';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.color = '#666';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.transition = 'color 0.3s';

        // Close button hover effect
        closeButton.onmouseover = () => {
          closeButton.style.color = '#ff5e5e';
        };
        closeButton.onmouseout = () => {
          closeButton.style.color = '#666';
        };
        closeButton.onclick = function () {
          closeModal(modal);
        };

        modalContent.appendChild(closeButton);
      }

      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      return modal;
    }

    // Function to close the modal
    function closeModal(modal) {
      if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => document.body.removeChild(modal), 300);
      }
    }

    async function extractArticle() {
      let article;
      if (window.location.href.startsWith('https://www.bbc.com')) {
        article = await handleBBCNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://edition.cnn.com/')) {
        article = await handleCNNNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://www.foxnews.com/')) {
        article = await handleFOXNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://nypost.com/')) {
        article = await handleNYPOSTNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://www.dailywire.com/')) {
        article = await handleDailyWireNews();
        if (article) {
          return article;
        }
      } else if (
        window.location.href.startsWith('https://www.thedailybeast.com/')
      ) {
        article = await handleDailyBeastNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://apnews.com')) {
        article = await handleAPNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://www.vox.com')) {
        article = await handleVOXNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://www.newsweek.com')) {
        article = await handleNewsWeekNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://thehill.com')) {
        article = await handleTheHillNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://www.geo.tv/')) {
        article = await handleGEONews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://arynews.tv/')) {
        article = await handleARYNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://www.usatoday.com')) {
        article = await handleUSATodayNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://www.aljazeera.com')) {
        article = await handleAlJazeeraNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://tribune.com.pk')) {
        article = await handleTribuneNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://www.reuters.com')) {
        article = await handleReutersNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith('https://www.nbcnews.com/')) {
        article = await handleNBCNews();
        if (article) {
          return article;
        }
      } else if (window.location.href.startsWith(NATIONAL_REVIEW_URL)) {                              // Using a global reference for the URL: https://www.nationalreview.com/
        article = await handleNationalReviewNews();
        if (article) {
          return article;
        }
      }
    }

    async function analyzeArticle(article) {
      const response = await fetch(
        'https://rjddund5of6xlwgxcdvqwyfqwy0qagyr.lambda-url.us-east-2.on.aws/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/html',
          },
          body: article,
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        return data.message;
      } else {
        return null;
      }
    }



    async function processNewsArticle() {
      // declare a variable
      let articleContent;
      // how this works
      // if the current webpage URL starts with 'url-specified'
      // Get the article content from the news function we write
      // if we get the article successfully
      // Send the article content to the API for neutralization and replace the original content on the page
      // the first argument is the article we send
      // the second argument is a class name or tag name in which we want to replace the article
      if (window.location.href.startsWith('https://www.bbc.com')) {
        articleContent = await handleBBCNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, 'article');
      } else if (window.location.href.startsWith('https://edition.cnn.com')) {
        articleContent = await handleCNNNews();
        if (articleContent)
          await neutralizeandReplaceContent(
            articleContent,
            '.article__content-container'
          );
      } else if (window.location.href.startsWith('https://www.foxnews.com')) {
        articleContent = await handleFOXNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.article-body');
      } else if (window.location.href.startsWith('https://nypost.com')) {
        articleContent = await handleNYPOSTNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.single__content');
      } else if (window.location.href.startsWith('https://www.dailywire.com')) {
        articleContent = await handleDailyWireNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.e1nzmkc90');
      } else if (window.location.href.startsWith('https://www.thedailybeast.com')) {
        articleContent = await handleDailyBeastNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.b-article-body');
      } else if (window.location.href.startsWith('https://apnews.com')) {
        articleContent = await handleAPNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.RichTextStoryBody');
      } else if (window.location.href.startsWith('https://www.vox.com')) {
        articleContent = await handleVOXNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '._1agbrixy');
      } else if (window.location.href.startsWith('https://www.newsweek.com')) {
        articleContent = await handleNewsWeekNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.article-body');
      } else if (window.location.href.startsWith('https://thehill.com')) {
        articleContent = await handleTheHillNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.article__text');
      } else if (window.location.href.startsWith('https://www.geo.tv')) {
        articleContent = await handleGEONews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.content-area');
      } else if (window.location.href.startsWith('https://arynews.tv/')) {
        articleContent = await handleARYNews();
        if (articleContent)
          await neutralizeandReplaceContent(
            articleContent,
            '.td-post-content > div'
          );
      } else if (window.location.href.startsWith('https://www.usatoday.com')) {
        articleContent = await handleUSATodayNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.gnt_ar_b');
      } else if (window.location.href.startsWith('https://www.aljazeera.com')) {
        articleContent = await handleAlJazeeraNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.wysiwyg');
      } else if (window.location.href.startsWith('https://tribune.com.pk')) {
        articleContent = await handleTribuneNews();
        if (articleContent)
          await neutralizeandReplaceContent(articleContent, '.story-text');
      } else if (window.location.href.startsWith('https://www.reuters.com')) {
        articleContent = await handleReutersNews();
        if (articleContent)
          await neutralizeandReplaceContent(
            articleContent,
            '.article-body__content__17Yit'
          );
      } else if (window.location.href.startsWith('https://www.nbcnews.com/')) {
        articleContent = await handleNBCNews();
        if (articleContent)
          await neutralizeandReplaceContent(
            articleContent,
            '.article-body__content'
          );

      } else if (window.location.href.startsWith(NATIONAL_REVIEW_URL)) {                         // Using a global reference for the URL: https://www.nationalreview.com/
        articleContent = await handleNationalReviewNews();
        if (articleContent)
          await neutralizeandReplaceContent(
            articleContent,
            NATIONAL_REVIEW_SELECTOR                                     // Using the global constant here

          );

      } else {
        alert('No article found');
      }
    }

    // 18 News Websites Function for extracting article from the Page

    // Steps in these Function || All the function performing same functionality
    // Function is Asynchronous and Name it according to the News Site Name
    // Select the article from the Page. If the article is present in article tag then select that otherwise select the relevant class in which the article is present
    // If article is found then:
    // Scroll the article to bring it view
    // Clone the article and make a copy of it
    // write the unwanted classes in an array that we do not want to send to our endpoint
    // Run a for for each loop and remove all the elements in it
    // return the inner html of article after removing unwanted classes and their data
    // If no article found then simply send an alert that article not found and return null

    //1 BBC Fn Start
    async function handleBBCNews() {
      let articleElement = document.querySelector('article');
      if (articleElement) {
        // articleElement.scrollIntoView(true);
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = [
          '.sc-2b5e3b35-3',
          '.sc-c361b622-0',
          '.sc-c31cc200-1',
        ];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        // alert('No article found');
        return null;
      }
    }
    // BBC Fn End

    //2 CCN Fn Start
    async function handleCNNNews() {
      let articleElement = document.querySelector('.article__content-container');
      if (articleElement) {
        return articleElement.innerHTML;
      } else {
        alert('No article found');
        return null;
      }
    }
    // CCN Fn End

    //3 FOX Fn Start
    async function handleFOXNews() {
      let articleElement = document.querySelector('.article-body');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = ['.ad-container', 'logged-out'];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        alert('No article found');
        return null;
      }
    }
    // FOX Fn End

    //4 New York Post Fn Start
    async function handleNYPOSTNews() {
      let articleElement = document.querySelector('.single__content');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);

        let unwantedSelectors = [
          '.single__inline-module',
          '.button--modal-trigger'
        ];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });

        //button--modal-trigger
        return clonedArticle.innerHTML;
      } else {
        alert('No article found');
        return null;
      }
    }
    // NYP Fn End
    //5 Daily Wire Fn Start
    async function handleDailyWireNews() {
      let articleElement = document.querySelector('.e1nzmkc90');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = ['.ad-wrapper'];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        alert('No article found');
        return null;
      }
    }
    // Daily Wire Fn End

    //6 Daily Beast News Fn Start
    async function handleDailyBeastNews() {
      let articleElement = document.querySelector('.b-article-body');
      // console.log('article element:', articleElement)
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        return articleElement.innerHTML;
      } else {
        // alert('No article found');
        return null;
      }
    }
    // Daily Beast News Fn End

    //7 AP News Fn Start
    async function handleAPNews() {
      let articleElement = document.querySelector('.RichTextStoryBody');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelector = clonedArticle.querySelector('.PageListStandardB');
        if (unwantedSelector) {
          unwantedSelector.remove();
        }
        return clonedArticle.innerHTML;
      } else {
        alert('No article found');
        return null;
      }
    }

    // AP News Fn End

    //8 Vox News Start
    async function handleVOXNews() {
      let articleElement = document.querySelector('._1agbrixy');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelector = clonedArticle.querySelector('._1tzd3in0');
        if (unwantedSelector) {
          unwantedSelector.remove();
        }
        return clonedArticle.innerHTML;
      } else {
        alert('No article found');
        return null;
      }
    }
    // Vox News End

    //9 News Week News Start
    async function handleNewsWeekNews() {
      let articleElement = document.querySelector('.article-body');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = [
          '.dfp-tag-wrapper',
          'iframe',
          '.newsletter-signup-horizontal',
          '.promo-link',
        ];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });

        return clonedArticle.innerHTML;
      } else {
        alert('No article found');
        return null;
      }
    }
    // News Week News Start

    //10 the hill News Start
    async function handleTheHillNews() {
      let articleElement = document.querySelector('.article__text');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelector = clonedArticle.querySelector('.ad-unit__content');
        if (unwantedSelector) {
          unwantedSelector.remove();
        }
        return clonedArticle.innerHTML;
      } else {
        alert('No article found');
        return null;
      }
    }
    // the hill News End

    //11 GEO News Start
    async function handleGEONews() {
      let articleElement = document.querySelector('.content-area');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = ['style', '.ads_between_content'];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        // alert('No article found');
        return null;
      }
    }
    // GEO News End

    //12 ARY News Start
    async function handleARYNews() {
      let articleElement = document.querySelector('.td-post-content > div ');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = [
          '.td-a-ad',
          '.spacing-container__container__2g5QT',
        ];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        alert('No article found');
        return null;
      }
    }
    // ARY News End

    //13 USA Today Start
    async function handleUSATodayNews() {
      let articleElement = document.querySelector('.gnt_ar_b');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = [
          '.gnt_em__fp',
          '.gnt_xmst',
          '.gnt_em_img',
          '.gnt_em_gl',
          '.gnt_em__lp',
          'aside',
        ];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        alert('No article found. Please Open any article on the current Page');
        return null;
      }
    }
    // USA Today End

    //15 AlJazeera News Start
    async function handleAlJazeeraNews() {
      let articleElement = document.querySelector('.wysiwyg');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = [
          '.sib-newsletter-form',
          '.video-player-facade-container',
          '.container--ads',
        ];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        alert('No article found. Please Open any article on the current Page');
        return null;
      }
    }
    // Aljazeera News End

    //16 Tribune News Start
    async function handleTribuneNews() {
      let articleElement = document.querySelector('.story-text');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = ['.google-auto-placed'];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        alert('No article found. Please Open any article on the current Page');
        return null;
      }
    }
    // Tribune News End

    //17 Reuters News Start
    async function handleReutersNews() {
      let articleElement = document.querySelector('.article-body__content__17Yit');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = ['.article-body__element__2p5pI'];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        // alert('No article found. Please Open any article on the current Page');
        return null;
      }
    }
    // Reuters News End

    //18 NBC News Start
    async function handleNBCNews() {
      let articleElement = document.querySelector('.article-body__content');
      if (articleElement) {
        // articleElement.scrollIntoView({ behavior: 'smooth' });
        let clonedArticle = articleElement.cloneNode(true);
        let unwantedSelectors = [
          '.ad',
          '.recommended-intersection-ref',
          '.inline-video',
        ];
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });
        return clonedArticle.innerHTML;
      } else {
        alert('No article found. Please Open any article on the current Page');
        return null;
      }
    }
    // NBC News End



    //19 NATIONAL REVIEW News
    async function handleNationalReviewNews() {
      //await new Promise(resolve => setTimeout(resolve, 1000));     // Adding a small delay before trying to extract the National Review article
      let articleElement = document.querySelector(NATIONAL_REVIEW_SELECTOR);                        // Using the global constant here
      if (articleElement) {
        let clonedArticle = articleElement.cloneNode(true);

        // Define unwanted selectors
        let unwantedSelectors = [
          '.cnx-ui-wrapper.cnx-bp-xl-lit',  // Compound class selector
          //'.aside-content'                    // Class for aside content
        ];

        // Remove unwanted elements
        unwantedSelectors.forEach((selector) => {
          let unwantedElements = clonedArticle.querySelectorAll(selector);
          unwantedElements.forEach((element) => element.remove());
        });

        return clonedArticle.innerHTML; // Return the cleaned HTML
      } else {
        return null; // No article found
      }
    }


    // Neutralize the article and replace the content through streaming
    async function neutralizeandReplaceContent(articleContent, selector) {

      // console.log('article content:', articleContent)
      // console.log('selector:', selector)

      const articleElement = document.querySelector(selector);
      const originalContent = articleElement.innerHTML; // Store the original content


      // Send a POST request to the API endpoint with the article content
      let response = await fetch(
        'https://mrmx3sylpb7qjuolhvlpusnckm0ygank.lambda-url.us-east-2.on.aws/',
        {
          method: 'POST', // Post method to send article to the server
          headers: {
            'Content-Type': 'text/html', // Content type is text/html
          },
          body: articleContent, // the article content that will be sent to server
        }
      );

      // If server responds with status code 200
      if (response.status === 200) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let neutralizedContent = ''; // Initialize an empty string to store the decoded content
        // let articleElement = document.querySelector(selector); // Select the article element


        // Clear any existing content in the article
        articleElement.innerHTML = '';

        // scroll to the article
        articleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => window.scrollBy(0, -200), 500); // Adjust delay as needed


        // Loop to read the response in chunks
        while (true) {

          const chunk = await reader.read();
          const { done, value } = chunk;


          if (done) break; // Exit if there are no more chunks

          // Decode the current chunk of binary data to text and append it
          neutralizedContent += decoder.decode(value, { stream: true });

          // Update the article's content on the page as we receive each chunk

          articleElement.innerHTML = neutralizedContent;

          // Automatically scroll the page to the current position of the article element
          // articleElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }


        // ----------------------------------------------------------------------------------------------------------------------------------------

        // below tasks performed after document is neutralized
        const buttonSpinner = shadowhost.shadowRoot.getElementById('button-spinner');
        const toggleButton = shadowhost.shadowRoot.getElementById('toggle-content-btn');

        console.log('spinner', buttonSpinner)
        console.log('toggleButton', toggleButton)

        buttonSpinner.style.display = 'none'

        shadowhost.shadowRoot.getElementById('button-text').textContent = 'Neutralized';

        setTimeout(() => {
          // hide the neturalize button
          shadowhost.shadowRoot.getElementById('neutralize-button-container').style.display = 'none';
          shadowhost.shadowRoot.getElementById('toggle-button-container').style.display = 'flex';

        }, 2000);



        // Add the toggle functionality for the button
        toggleButton.onclick = () => {
          if (toggleButton.textContent === 'See Original') {
            articleElement.innerHTML = originalContent; // Show original content
            toggleButton.textContent = 'See Neutralized'; // Update button text
          } else {
            articleElement.innerHTML = neutralizedContent; // Show neutralized content
            toggleButton.textContent = 'See Original'; // Update button text
          }
        };
        // -----------------------------------------------------------------------------------------------------------------------------------------

        const thirdModal = showModal('Article Neutralized Successfully', false);
        setTimeout(function () {
          closeModal(thirdModal);
        }, 2000);
      } else {
        alert('Internal Server Error'); // Error handling if response is not 200
      }
    }
  },
});
