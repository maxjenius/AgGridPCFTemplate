import { IDateComp, IDateParams } from '@ag-grid-community/core';

export default class DateTimeInput implements IDateComp {
    private input!: HTMLInputElement;
    private params!: IDateParams;

    public getGui(): HTMLElement {
        return this.input;
    }

    public init(params: IDateParams): void {
        this.params = params;
        this.input = document.createElement('input');
        this.input.type = 'datetime-local';
        this.input.classList.add('ag-input-field-input', 'ag-date-field-input');
        this.input.addEventListener('change', () => this.params.onDateChanged());
    }

    public getDate(): Date | null {
        return this.input.value ? new Date(this.input.value) : null;
    }

    public setDate(date: Date | null): void {
        this.input.value = date ? date.toISOString().slice(0, 19) : '';
    }

    public setInputPlaceholder(placeholder?: string | null): void {
        if (placeholder) {
            this.input.placeholder = placeholder;
        } else {
            this.input.removeAttribute('placeholder');
        }
    }

    public setDisabled(disabled: boolean): void {
        this.input.disabled = disabled;
    }

    public afterGuiAttached(): void {
        this.input.focus();
    }
}
