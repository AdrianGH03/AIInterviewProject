import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare const monaco: any;

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="code-editor-wrapper rounded-lg overflow-hidden border border-slate-700">
      <!-- Language selector & run button -->
      <div class="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
        <div class="flex items-center gap-3">
          <select
            [value]="language"
            (change)="onLanguageChange($event)"
            class="bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-sm focus:outline-none">
            <option value="python">Python</option>
          </select>
          <span class="text-slate-500 text-xs">Code Editor</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="onRun()"
            [disabled]="isRunning"
            class="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5">
            @if (isRunning) {
              <svg class="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Running...
            } @else {
              ▶ Run
            }
          </button>
          <button
            (click)="onReset()"
            class="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded text-sm transition-colors">
            Reset
          </button>
        </div>
      </div>

      <!-- Editor container -->
      <div #editorContainer class="editor-container" [style.height.px]="editorHeight"></div>

      <!-- Output panel -->
      @if (showOutput) {
        <div class="bg-slate-900 border-t border-slate-700">
          <div class="flex items-center justify-between px-4 py-1.5 bg-slate-800/50">
            <span class="text-slate-400 text-xs font-medium">Output</span>
            <button (click)="showOutput = false" class="text-slate-500 hover:text-slate-300 text-xs">✕</button>
          </div>
          <pre class="p-4 text-sm font-mono max-h-48 overflow-auto whitespace-pre-wrap"
               [class]="outputError ? 'text-red-400' : 'text-green-300'">{{ output }}</pre>
        </div>
      }
    </div>
  `,
  styles: `
    .editor-container {
      width: 100%;
    }
  `,
})
export class CodeEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer') editorContainer!: ElementRef;

  @Input() language = 'python';
  @Input() initialCode = '# Write your solution here\n\n';
  @Input() editorHeight = 300;
  @Input() isRunning = false;

  @Output() runCode = new EventEmitter<{ language: string; code: string }>();
  @Output() codeChange = new EventEmitter<string>();

  showOutput = false;
  output = '';
  outputError = false;

  private editor: any = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.loadMonaco();
    }
  }

  ngOnDestroy(): void {
    this.editor?.dispose();
  }

  private loadMonaco(): void {
    const onGot = () => {
      (window as any).monaco.editor.defineTheme('interviewDark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1e293b',
          'editor.lineHighlightBackground': '#334155',
          'editorLineNumber.foreground': '#64748b',
        },
      });

      this.editor = (window as any).monaco.editor.create(
        this.editorContainer.nativeElement,
        {
          value: this.initialCode,
          language: this.language,
          theme: 'interviewDark',
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          padding: { top: 12 },
        },
      );

      this.editor.onDidChangeModelContent(() => {
        this.codeChange.emit(this.editor.getValue());
      });
    };

    if ((window as any).monaco) {
      onGot();
      return;
    }

    const script = document.createElement('script');
    script.src = 'monaco-editor/vs/loader.js';
    script.onload = () => {
      const require = (window as any).require;
      require.config({ paths: { vs: 'monaco-editor/vs' } });
      require(['vs/editor/editor.main'], () => onGot());
    };
    document.head.appendChild(script);
  }

  getCode(): string {
    return this.editor?.getValue() ?? this.initialCode;
  }

  setCode(code: string): void {
    this.editor?.setValue(code);
  }

  setOutput(stdout: string, stderr: string, timedOut: boolean): void {
    this.showOutput = true;
    if (timedOut) {
      this.output = 'Execution timed out.';
      this.outputError = true;
    } else if (stderr) {
      this.output = stderr;
      this.outputError = true;
    } else {
      this.output = stdout || '(no output)';
      this.outputError = false;
    }
  }

  onRun(): void {
    this.runCode.emit({
      language: this.language,
      code: this.getCode(),
    });
  }

  onReset(): void {
    this.setCode(this.initialCode);
    this.showOutput = false;
    this.output = '';
  }

  onLanguageChange(event: Event): void {
    this.language = (event.target as HTMLSelectElement).value;
  }
}
