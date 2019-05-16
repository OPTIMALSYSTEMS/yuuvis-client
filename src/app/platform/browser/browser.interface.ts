
export interface IBrowserService {
    open(url: string): string;
    close(id: string): void;
}