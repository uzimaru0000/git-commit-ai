export type Optional<T> = T extends T | undefined ? T : never;

export type OptionalRecord<T> = {
    [K in keyof T]?: Optional<T[K]>
}
