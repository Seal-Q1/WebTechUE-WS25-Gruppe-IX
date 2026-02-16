export function urlEncode(...objects: Record<string, string | number | boolean | undefined | null>[]) {
    let params: string[] = [];

    for (const object of objects) {

        for (const key in object) {
            const value = object[key];
            if (value !== undefined && value !== null) {
                params.push(key + "=" + object[key]!);
            }
        }

    }
    return params.join("&");
}