chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.action === 'readNews') {
    // how this works
    // if the current webpage URL starts with 'url-specified'
    // Get the article content from the news function we write
    // if we get the article successfully
    // Send the article content to the API for neutralization and replace the original content on the page
    // the first argument is the article we send
    // the second argument is a class name or tag name in which we want to replace the article
    if (window.location.href.startsWith('https://www.bbc.com')) {
      let articleContent = await handleBBCNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, 'article');
      }
    } else if (window.location.href.startsWith('https://edition.cnn.com')) {
      let articleContent = await handleCNNNews();
      if (articleContent) {
        await neutralizeandReplaceContent(
          articleContent,
          '.article__content-container'
        );
      }
    } else if (window.location.href.startsWith('https://www.foxnews.com')) {
      let articleContent = await handleFOXNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.article-body');
      }
    } else if (window.location.href.startsWith('https://nypost.com')) {
      let articleContent = await handleNYPOSTNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.single__content');
      }
    } else if (window.location.href.startsWith('https://www.dailywire.com')) {
      let articleContent = await handleDailyWireNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.e1nzmkc90');
      }
    } else if (
      window.location.href.startsWith('https://www.thedailybeast.com')
    ) {
      let articleContent = await handleDailyBeastNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, 'article');
      }
    } else if (window.location.href.startsWith('https://apnews.com')) {
      let articleContent = await handleAPNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.RichTextStoryBody');
      }
    } else if (window.location.href.startsWith('https://www.vox.com')) {
      let articleContent = await handleVOXNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '._1agbrixt');
      }
    } else if (window.location.href.startsWith('https://www.newsweek.com')) {
      let articleContent = await handleNewsWeekNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.article-body');
      }
    } else if (window.location.href.startsWith('https://thehill.com')) {
      let articleContent = await handleTheHillNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.article__text');
      }
    } else if (window.location.href.startsWith('https://www.geo.tv')) {
      let articleContent = await handleGEONews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.content-area');
      }
    } else if (window.location.href.startsWith('https://arynews.tv/')) {
      let articleContent = await handleARYNews();
      if (articleContent) {
        await neutralizeandReplaceContent(
          articleContent,
          '.td-post-content > div'
        );
      }
    } else if (window.location.href.startsWith('https://www.usatoday.com')) {
      let articleContent = await handleUSATodayNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.gnt_ar_b');
      }
    } else if (window.location.href.startsWith('https://www.aljazeera.com')) {
      let articleContent = await handleAlJazeeraNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.wysiwyg');
      }
    } else if (window.location.href.startsWith('https://tribune.com.pk')) {
      let articleContent = await handleTribuneNews();
      if (articleContent) {
        await neutralizeandReplaceContent(articleContent, '.story-text');
      }
    } else if (window.location.href.startsWith('https://www.reuters.com')) {
      let articleContent = await handleReutersNews();
      if (articleContent) {
        await neutralizeandReplaceContent(
          articleContent,
          '.article-body__content__17Yit'
        );
      }
    } else if (window.location.href.startsWith('https://www.nbcnews.com/')) {
      let articleContent = await handleNBCNews();
      if (articleContent) {
        await neutralizeandReplaceContent(
          articleContent,
          '.article-body__content'
        );
      }
    } else {
      alert('No article found   ');
    }
  }
});

//1 BBC Fn Start
async function handleBBCNews() {
  let articleElement = document.querySelector('article');
  if (articleElement) {
    articleElement.scrollIntoView(true);
    let clonedArticle = articleElement.cloneNode(true);
    let unwantedSelectors = ['.sc-8b3e1b0d-3', '.sc-c361b622-0'];
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
// BBC Fn End

//2 CCN Fn Start
async function handleCNNNews() {
  let articleElement = document.querySelector('.article__content-container');
  if (articleElement) {
    articleElement.scrollIntoView(true);
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
    articleElement.scrollIntoView(true);
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
    articleElement.scrollIntoView({ behavior: 'smooth' });
    let clonedArticle = articleElement.cloneNode(true);
    let unwantedSelector = clonedArticle.querySelector(
      '.single__inline-module'
    );
    if (unwantedSelector) {
      unwantedSelector.remove();
    }
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
    articleElement.scrollIntoView({ behavior: 'smooth' });
    return articleElement.innerHTML;
  } else {
    alert('No article found');
    return null;
  }
}
// Daily Wire Fn End

//6 Daily Beast News Fn Start
async function handleDailyBeastNews() {
  let articleElement = document.querySelector('article');
  if (articleElement) {
    articleElement.scrollIntoView({ behavior: 'smooth' });
    return articleElement.innerHTML;
  } else {
    alert('No article found');
    return null;
  }
}
// Daily Beast News Fn End

//7 AP News Fn Start
async function handleAPNews() {
  let articleElement = document.querySelector('.RichTextStoryBody');
  if (articleElement) {
    articleElement.scrollIntoView({ behavior: 'smooth' });
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
  let articleElement = document.querySelector('._1agbrixt');
  if (articleElement) {
    articleElement.scrollIntoView({ behavior: 'smooth' });
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
    articleElement.scrollIntoView({ behavior: 'smooth' });
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
    articleElement.scrollIntoView({ behavior: 'smooth' });
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
    articleElement.scrollIntoView({ behavior: 'smooth' });
    let clonedArticle = articleElement.cloneNode(true);
    let unwantedSelectors = ['style', '.ads_between_content'];
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
// GEO News End

//12 ARY News Start
async function handleARYNews() {
  let articleElement = document.querySelector('.td-post-content > div ');
  if (articleElement) {
    articleElement.scrollIntoView({ behavior: 'smooth' });
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
    articleElement.scrollIntoView({ behavior: 'smooth' });
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

//14 AlJazeera News Start
async function handleAlJazeeraNews() {
  let articleElement = document.querySelector('.wysiwyg');
  if (articleElement) {
    articleElement.scrollIntoView({ behavior: 'smooth' });
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

//15 Tribune News Start
async function handleTribuneNews() {
  let articleElement = document.querySelector('.story-text');
  if (articleElement) {
    articleElement.scrollIntoView({ behavior: 'smooth' });
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

//16 Reuters News Start
async function handleReutersNews() {
  let articleElement = document.querySelector('.article-body__content__17Yit');
  if (articleElement) {
    articleElement.scrollIntoView({ behavior: 'smooth' });
    let clonedArticle = articleElement.cloneNode(true);
    let unwantedSelectors = ['.article-body__element__2p5pI'];
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
// Reuters News End

//17 NBC News Start
async function handleNBCNews() {
  let articleElement = document.querySelector('.article-body__content');
  if (articleElement) {
    articleElement.scrollIntoView({ behavior: 'smooth' });
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

async function neutralizeandReplaceContent(articleContent, selector) {
  alert('Please wait... The response is generating.');

  let response = await fetch(
    'https://mrmx3sylpb7qjuolhvlpusnckm0ygank.lambda-url.us-east-2.on.aws/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html',
      },
      body: articleContent,
    }
  );

  if (response.status === 200) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let neutralizedContent = '';
    let articleElement = document.querySelector(selector);

    while (true) {
      const chunk = await reader.read();
      const { done, value } = chunk;
      if (done) break;
      neutralizedContent =
        neutralizedContent + decoder.decode(value, { stream: true });
      articleElement.innerHTML = neutralizedContent;
    }
    alert('Content neutralized and replaced successfully.');
  } else {
    alert('Internal Server Error');
  }
}
