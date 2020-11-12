export = AvjItem;

declare type AvjItem = {
	err?: NodeJS.ErrnoException | Error;
	formatted?: boolean;
	path: Required<string>;
};
