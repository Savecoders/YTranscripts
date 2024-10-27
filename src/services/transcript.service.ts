import BrowserAdapter from './browser.adapter';

class TranscriptService {
  private readonly browser: BrowserAdapter<BrowserTab>;

  constructor(browserAdapter: BrowserAdapter<BrowserTab>) {
    this.browser = browserAdapter;
  }

  async getUrlBroswerTab(): Promise<string | undefined> {
    const tab = await this.browser.getBrowserTab();
    return tab.url;
  }

  async isYoutubeTab(): Promise<boolean | undefined> {
    const url = await this.getUrlBroswerTab();
    return url?.includes('youtube.com');
  }

  async textTranscriptionVideo(): Promise<string | null> {
    if (!(await this.isYoutubeTab())) {
      return null;
    }

    const textTranscription = await this.browser.executeScript(async () => {
      // DOM tab selectors
      const ytTranscriptSectionStyle =
        'style-scope ytd-video-description-transcript-section-renderer';
      const transcriptSegmentsContainerID = 'segments-container';

      // get transcript s
      const transcriptSectionAviable = document.getElementsByClassName(ytTranscriptSectionStyle);

      if (!transcriptSectionAviable) {
        return null;
      }

      const trasncriptSectionContent = [...transcriptSectionAviable];

      trasncriptSectionContent.forEach(el => {
        // click button in transcript section
        if (el.tagName === 'YTD-BUTTON-RENDERER') {
          el.getElementsByTagName('button')[0].click();
        }
      });

      // wait for transcript to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      const transcriptSegmentsContainer = document.getElementById(transcriptSegmentsContainerID);

      if (!transcriptSegmentsContainer) {
        return null;
      }

      const transcriptSegments = [...transcriptSegmentsContainer.children];

      const transcriptSegmentsText = transcriptSegments.map(el => {
        // el is div and need get yt-formatted-string tag
        const ytFormattedString = el.getElementsByTagName('yt-formatted-string');
        if (ytFormattedString.length > 0) {
          const transcription = `${ytFormattedString[0].innerHTML}`;
          return transcription;
        }
      });

      const transcript = transcriptSegmentsText.join(' ');
      return transcript;
    });

    return textTranscription;
  }
}

export default TranscriptService;
