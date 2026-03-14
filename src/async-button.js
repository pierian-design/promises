class AsyncButton {
  constructor(buttonElement, asyncFn, onError) {
    this.button = buttonElement;
    this.asyncFn = asyncFn;
    this.onError = onError;
    this.isLoading = false;
    this.abortController = null;
    this.originalText = buttonElement.textContent;
    this.loadingText = buttonElement.dataset.loadingText || 'Loading...';
    this.handleClick = this.handleClick.bind(this);
    this.button.addEventListener('click', this.handleClick);
  }

  async handleClick(event) {
    if (this.isLoading) {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
      return;
    }

    this.isLoading = true;
    this.button.disabled = true;
    this.button.textContent = this.loadingText;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const result = await this.runWithSignal(this.asyncFn, signal);
      this.button.textContent = this.originalText;
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        this.button.textContent = 'Error!';
        if (this.onError) this.onError(error);
        setTimeout(() => {
          if (!this.isLoading) {
            this.button.textContent = this.originalText;
          }
        }, 2000);
      }
    } finally {
      this.button.disabled = false;
      this.isLoading = false;
      this.abortController = null;
    }
  }

  runWithSignal(fn, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error('Aborted'));
        return;
      }
      const onAbort = () => reject(new Error('Aborted'));
      signal.addEventListener('abort', onAbort, { once: true });
      fn().then(resolve, reject).finally(() => {
        signal.removeEventListener('abort', onAbort);
      });
    });
  }

  destroy() {
    if (this.abortController) this.abortController.abort();
    this.button.removeEventListener('click', this.handleClick);
  }
}