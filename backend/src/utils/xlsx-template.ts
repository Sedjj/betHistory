import path from 'path';
import zip from 'jszip';
import element from 'elementtree';

// tslint:disable-next-line:variable-name only-arrow-functions
const _get_simple = function(obj: { [x: string]: any; }, desc: string | number) {
	// @ts-ignore
	if (desc && desc.indexOf('[') >= 0) {
		// @ts-ignore
		const specification = desc.split(/[[[\]]/);
		const property = specification[0];
		const index = specification[1];
		return obj[property][index];
	}

	return obj[desc];
};

/**
 * Based on http://stackoverflow.com/questions/8051975
 * Mimic https://lodash.com/docs#get
 */
	// tslint:disable-next-line:only-arrow-functions variable-name
const _get = function(obj: any, desc: any, defaultValue: any) {
		const arr = desc.split('.');
		try {
			while (arr.length) {
				obj = _get_simple(obj, arr.shift());
			}
		} catch (ex) {
			/* invalid chain */
			obj = undefined;
		}
		return obj === undefined ? defaultValue : obj;
	};

export default class XlsxTemplate {
	private DOCUMENT_RELATIONSHIP: string = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument';
	private CALC_CHAIN_RELATIONSHIP: string = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/calcChain';
	private SHARED_STRINGS_RELATIONSHIP: string = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings';
	private HYPERLINK_RELATIONSHIP: string = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink';
	private archive: any;
	private sharedStrings: any;
	private sharedStringsLookup: any;
	private workbook: any;
	private workbookRels: any;
	private prefix: any;
	private sheets: any;
	private workbookPath: any;
	private calChainRel: any;
	private calcChainPath: any;
	private sharedStringsPath: any;

	constructor(data: any) {
		this.archive = null;
		this.sharedStrings = [];
		this.sharedStringsLookup = {};

		if (data) {
			this.loadTemplate(data);
		}
	}

	/**
	 * Delete unused sheets if needed
	 */
	public deleteSheet = (sheetName: any) => {
		const sheet = this.loadSheet(sheetName);

		const sh = this.workbook.find('sheets/sheet[@sheetId=\'' + sheet.id + '\']');
		this.workbook.find('sheets').remove(sh);

		const rel = this.workbookRels.find('Relationship[@Id=\'' + sh.attrib['r:id'] + '\']');
		this.workbookRels.remove(rel);

		this._rebuild();
		return this;
	};

	/**
	 * Clone sheets in current workbook template
	 */
	public copySheet = (sheetName: any, copyName: string) => {
		const sheet = this.loadSheet(sheetName); // filename, name , id, root
		const newSheetIndex = (this.workbook.findall('sheets/sheet').length + 1).toString();
		const fileName = 'worksheets' + '/' + 'sheet' + newSheetIndex + '.xml';
		const arcName = this.prefix + '/' + fileName;

		// @ts-ignore
		this.archive.file(arcName, element.tostring(sheet.root));
		this.archive.files[arcName].options.binary = true;

		const newSheet = element.SubElement(this.workbook.find('sheets'), 'sheet');
		newSheet.attrib.name = copyName || 'Sheet' + newSheetIndex;
		newSheet.attrib.sheetId = newSheetIndex;
		newSheet.attrib['r:id'] = 'rId' + newSheetIndex;

		const newRel = element.SubElement(this.workbookRels, 'Relationship');
		newRel.attrib.Type = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet';
		newRel.attrib.Target = fileName;

		this._rebuild();
//    TODO: work with "definedNames"
//    let defn = element.SubElement(this.find('definedNames'), 'definedName');
//
		return this;
	};

	/**
	 *  Partially rebuild after copy/delete sheets
	 */
		// tslint:disable-next-line:variable-name
	public _rebuild = () => {
		// each <sheet> 'r:id' attribute in '\xl\workbook.xml'
		// must point to correct <Relationship> 'Id' in xl\_rels\workbook.xml.rels

		const order = ['worksheet', 'theme', 'styles', 'sharedStrings'];

		this.workbookRels.findall('*')
			.sort((rel1: any, rel2: any) => { // using order
				const index1 = order.indexOf(path.basename(rel1.attrib.Type));
				const index2 = order.indexOf(path.basename(rel2.attrib.Type));
				if ((index1 + index2) === 0) {
					if (rel1.attrib.Id && rel2.attrib.Id) {
						return rel1.attrib.Id.substring(3) - rel2.attrib.Id.substring(3);
					}
					return rel1._id - rel2._id;
				}
				return index1 - index2;
			})
			.forEach((item: any, index: any) => {
				item.attrib.Id = 'rId' + (index + 1);
			});

		this.workbook.findall('sheets/sheet').forEach((item: any, index: any) => {
			item.attrib['r:id'] = 'rId' + (index + 1);
			item.attrib.sheetId = (index + 1).toString();
		});

		// @ts-ignore
		this.archive.file(this.prefix + '/' + '_rels' + '/' + path.basename(this.workbookPath) + '.rels', element.tostring(this.workbookRels));
		// @ts-ignore
		this.archive.file(this.workbookPath, element.tostring(this.workbook));
		this.sheets = this.loadSheets(this.prefix, this.workbook, this.workbookRels);
	};

	/**
	 * Load a .xlsx file from a byte array.
	 */
	public loadTemplate = (data: any) => {
		if (Buffer.isBuffer(data)) {
			data = data.toString('binary');
		}

		this.archive = new zip(data, {base64: false, checkCRC32: true});

		// Load relationships
		const rels = element.parse(this.archive.file('_rels/.rels').asText()).getroot();
		// @ts-ignore
		const workbookPath = rels.find('Relationship[@Type=\'' + this.DOCUMENT_RELATIONSHIP + '\']').attrib.Target;

		this.workbookPath = workbookPath;
		// @ts-ignore
		this.prefix = path.dirname(workbookPath);
		this.workbook = element.parse(this.archive.file(workbookPath).asText()).getroot();
		// @ts-ignore
		this.workbookRels = element.parse(this.archive.file(this.prefix + '/' + '_rels' + '/' + path.basename(workbookPath) + '.rels').asText()).getroot();
		this.sheets = this.loadSheets(this.prefix, this.workbook, this.workbookRels);
		this.calChainRel = this.workbookRels.find('Relationship[@Type=\'' + this.CALC_CHAIN_RELATIONSHIP + '\']');

		if (this.calChainRel) {
			this.calcChainPath = this.prefix + '/' + this.calChainRel.attrib.Target;
		}

		this.sharedStringsPath = this.prefix + '/' + this.workbookRels.find('Relationship[@Type=\'' + this.SHARED_STRINGS_RELATIONSHIP + '\']').attrib.Target;
		this.sharedStrings = [];
		// tslint:disable-next-line:only-arrow-functions
		element.parse(this.archive.file(this.sharedStringsPath).asText()).getroot().findall('si').forEach((si) => {
			const t = {text: ''};
			si.findall('t').forEach(tmp => {
				t.text += tmp.text;
			});
			si.findall('r/t').forEach(tmp => {
				t.text += tmp.text;
			});
			this.sharedStrings.push(t.text);
			this.sharedStringsLookup[t.text] = this.sharedStrings.length - 1;
		});
	};

	/**
	 * Interpolate values for the sheet with the given number (1-based) or
	 * name (if a string) using the given substitutions (an object).
	 */
	public substitute = (sheetName: any, substitutions: any) => {

		const sheet = this.loadSheet(sheetName);

		const dimension = sheet.root.find('dimension');
		const sheetData: any = sheet.root.find('sheetData');
		let currentRow: null = null;
		let totalRowsInserted = 0;
		let totalColumnsInserted = 0;
		const namedTables = this.loadTables(sheet.root, sheet.filename);
		const rows: any[] | never[] = [];

		sheetData.findall('row').forEach((row: any) => {
			row.attrib.r = currentRow = this.getCurrentRow(row, totalRowsInserted);
			// @ts-ignore
			rows.push(row);

			const cells: any[] | never[] = [];
			let cellsInserted = 0;
			const newTableRows: never[] = [];

			row.findall('c').forEach((cell: any) => {
				let appendCell = true;
				cell.attrib.r = this.getCurrentCell(cell, currentRow, cellsInserted);

				// If c[@t="s"] (string column), look up /c/v@text as integer in
				// `this.sharedStrings`
				if (cell.attrib.t === 's') {

					// Look for a shared string that may contain placeholders
					const cellValue = cell.find('v');
					const stringIndex = parseInt(cellValue.text, 10);
					// tslint:disable-next-line:variable-name
					let string: any = this.sharedStrings[stringIndex];

					if (string === undefined) {
						return;
					}

					// Loop over placeholders
					this.extractPlaceholders(string).forEach((placeholder: any) => {

						// Only substitute things for which we have a substitution
						let substitution = _get(substitutions, placeholder.name, '');
						let newCellsInserted = 0;

						if (placeholder.full && placeholder.type === 'table' && substitution instanceof Array) {
							newCellsInserted = this.substituteTable(
								row, newTableRows,
								cells, cell,
								namedTables, substitution, placeholder.key
							);

							// don't double-insert cells
							// this applies to arrays only, incorrectly applies to object arrays when there a single row, thus not rendering single row
							if (newCellsInserted !== 0 || substitution.length) {
								if (substitution.length === 1) {
									appendCell = true;
								}
								if (substitution[0][placeholder.key] instanceof Array) {
									appendCell = false;
								}
							}

							// Did we insert new columns (array values)?
							if (newCellsInserted !== 0) {
								cellsInserted += newCellsInserted;
								this.pushRight(this.workbook, sheet.root, cell.attrib.r, newCellsInserted);
							}
						} else if (placeholder.full && placeholder.type === 'normal' && substitution instanceof Array) {
							appendCell = false; // don't double-insert cells
							newCellsInserted = this.substituteArray(
								cells, cell, substitution
							);

							if (newCellsInserted !== 0) {
								cellsInserted += newCellsInserted;
								this.pushRight(this.workbook, sheet.root, cell.attrib.r, newCellsInserted);
							}
						} else {
							if (placeholder.key) {
								// @ts-ignore
								substitution = _get(substitutions, placeholder.name + '.' + placeholder.key);
							}
							string = this.substituteScalar(cell, string, placeholder, substitution);
						}
					});
				}

				// if we are inserting columns, we may not want to keep the original cell anymore
				if (appendCell) {
					// @ts-ignore
					cells.push(cell);
				}

			}); // cells loop

			// We may have inserted columns, so re-build the children of the row
			this.replaceChildren(row, cells);

			// Update row spans attribute
			if (cellsInserted !== 0) {
				this.updateRowSpan(row, cellsInserted);

				if (cellsInserted > totalColumnsInserted) {
					totalColumnsInserted = cellsInserted;
				}

			}

			// Add newly inserted rows
			if (newTableRows.length > 0) {
				// tslint:disable-next-line:no-shadowed-variable
				newTableRows.forEach(row => {
					rows.push(row);
					++totalRowsInserted;
				});
				this.pushDown(this.workbook, sheet.root, namedTables, currentRow, newTableRows.length);
			}

		}); // rows loop

		// We may have inserted rows, so re-build the children of the sheetData
		this.replaceChildren(sheetData, rows);

		// Update placeholders in table column headers
		this.substituteTableColumnHeaders(namedTables, substitutions);

		// Update placeholders in hyperlinks
		this.substituteHyperlinks(sheet.filename, substitutions);

		// Update <dimension /> if we added rows or columns
		if (dimension) {
			if (totalRowsInserted > 0 || totalColumnsInserted > 0) {
				// @ts-ignore
				const dimensionRange = this.splitRange(dimension.attrib.ref);
				const dimensionEndRef = this.splitRef(dimensionRange.end);

				dimensionEndRef.row += totalRowsInserted;
				dimensionEndRef.col = this.numToChar(this.charToNum(dimensionEndRef.col) + totalColumnsInserted);
				dimensionRange.end = this.joinRef(dimensionEndRef);

				dimension.attrib.ref = this.joinRange(dimensionRange);
			}
		}

		// Here we are forcing the values in formulas to be recalculated
		// existing as well as just substituted
		sheetData.findall('row').forEach((row: any) => {
			row.findall('c').forEach((cell: any) => {
				const formulas = cell.findall('f');
				if (formulas && formulas.length > 0) {
					cell.findall('v').forEach((v: any) => {
						cell.remove(v);
					});
				}
			});
		});

		// Write back the modified XML trees
		// @ts-ignore
		this.archive.file(sheet.filename, element.tostring(sheet.root));
		// @ts-ignore
		this.archive.file(this.workbookPath, element.tostring(this.workbook));

		// Remove calc chain - Excel will re-build, and we may have moved some formulae
		if (this.calcChainPath && this.archive.file(this.calcChainPath)) {
			this.archive.remove(this.calcChainPath);
		}

		this.writeSharedStrings();
		this.writeTables(namedTables);
	};

	/**
	 * Generate a new binary .xlsx file
	 */
	public generate = (options: any) => {
		if (!options) {
			options = {
				base64: false
			};
		}

		return this.archive.generate(options);
	};

	// Helpers

	// Write back the new shared strings list
	public writeSharedStrings = () => {
		const root = element.parse(this.archive.file(this.sharedStringsPath).asText()).getroot();
		const children = root.getchildren();

		root.delSlice(0, children.length);

		this.sharedStrings.forEach((str: string) => {
			// @ts-ignore
			const si = new element.Element('si');
			// @ts-ignore
			const t = new element.Element('t');

			t.text = str;
			si.append(t);
			root.append(si);
		});

		root.attrib.count = this.sharedStrings.length;
		root.attrib.uniqueCount = this.sharedStrings.length;

		// @ts-ignore
		this.archive.file(this.sharedStringsPath, element.tostring(root));
	};

	// Add a new shared string
	public addSharedString = (s: string | number) => {
		const idx = this.sharedStrings.length;
		this.sharedStrings.push(s);
		this.sharedStringsLookup[s] = idx;

		return idx;
	};

	// Get the number of a shared string, adding a new one if necessary.
	public stringIndex = (s: string | number) => {
		let idx = this.sharedStringsLookup[s];
		if (idx === undefined) {
			idx = this.addSharedString(s);
		}
		return idx;
	};

	// Replace a shared string with a new one at the same index. Return the
	// index.
	public replaceString = (oldString: string | number, newString: string | number) => {
		let idx = this.sharedStringsLookup[oldString];
		if (idx === undefined) {
			idx = this.addSharedString(newString);
		} else {
			this.sharedStrings[idx] = newString;
			delete this.sharedStringsLookup[oldString];
			this.sharedStringsLookup[newString] = idx;
		}

		return idx;
	};

	// Get a list of sheet ids, names and filenames
	public loadSheets = (prefix: string, workbook: any, workbookRels: any) => {
		const sheets: any[] = [];

		workbook.findall('sheets/sheet').forEach((sheet: any) => {
			const sheetId = sheet.attrib.sheetId;
			const relId = sheet.attrib['r:id'];
			const relationship = workbookRels.find('Relationship[@Id=\'' + relId + '\']');
			// @ts-ignore
			const filename = prefix + '/' + relationship.attrib.Target;

			sheets.push({
				id: parseInt(sheetId, 10),
				name: sheet.attrib.name,
				filename
			});
		});

		return sheets;
	};

	// Get sheet a sheet, including filename and name
	public loadSheet = (sheet: any) => {
		let info = null;

		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < this.sheets.length; ++i) {
			if ((typeof (sheet) === 'number' && this.sheets[i].id === sheet) || (this.sheets[i].name === sheet)) {
				info = this.sheets[i];
				break;
			}
		}

		if (info === null && (typeof (sheet) === 'number')) {
			// Get the sheet that corresponds to the 0 based index if the id does not work
			info = this.sheets[sheet - 1];
		}

		if (info === null) {
			throw new Error('Sheet ' + sheet + ' not found');
		}

		return {
			filename: info.filename,
			name: info.name,
			id: info.id,
			root: element.parse(this.archive.file(info.filename).asText()).getroot()
		};
	};

	// Load tables for a given sheet
	public loadTables = (sheet: any, sheetFilename: any) => {
		const sheetDirectory = path.dirname(sheetFilename);
		const sheetName = path.basename(sheetFilename);
		const relsFilename = sheetDirectory + '/' + '_rels' + '/' + sheetName + '.rels';
		const relsFile = this.archive.file(relsFilename);
		const tables: any[] = []; // [{filename: ..., root: ....}]

		if (relsFile === null) {
			return tables;
		}

		const rels = element.parse(relsFile.asText()).getroot();

		sheet.findall('tableParts/tablePart').forEach((tablePart: any) => {
			const relationshipId = tablePart.attrib['r:id'];
			// @ts-ignore
			const target = rels.find('Relationship[@Id=\'' + relationshipId + '\']').attrib.Target;
			// @ts-ignore
			const tableFilename = target.replace('..', this.prefix);
			const tableTree = element.parse(this.archive.file(tableFilename).asText());

			tables.push({
				filename: tableFilename,
				root: tableTree.getroot()
			});
		});

		return tables;
	};

	// Write back possibly-modified tables
	public writeTables = (tables: any) => {
		tables.forEach((namedTable: any) => {
			// @ts-ignore
			this.archive.file(namedTable.filename, element.tostring(namedTable.root));
		});
	};

	// Perform substitution in hyperlinks
	public substituteHyperlinks = (sheetFilename: any, substitutions: any) => {
		const sheetDirectory = path.dirname(sheetFilename);
		const sheetName = path.basename(sheetFilename);
		const relsFilename = sheetDirectory + '/' + '_rels' + '/' + sheetName + '.rels';
		const relsFile = this.archive.file(relsFilename);

		element.parse(this.archive.file(this.sharedStringsPath).asText()).getroot();

		if (relsFile === null) {
			return;
		}

		const rels = element.parse(relsFile.asText()).getroot();

		// @ts-ignore
		const relationships = rels._children;

		const newRelationships: any[] = [];

		relationships.forEach((relationship: { attrib: { Type: string; Target: string; }; }) => {
			newRelationships.push(relationship);

			if (relationship.attrib.Type === this.HYPERLINK_RELATIONSHIP) {

				let target = relationship.attrib.Target;

				// Double-decode due to excel double encoding url placeholders
				target = decodeURI(decodeURI(target));
				// @ts-ignore
				this.extractPlaceholders(target).forEach(placeholder => {
						const substitution = substitutions[placeholder.name];

						if (substitution === undefined) {
							return;
						}
						target = target.replace(placeholder.placeholder, this.stringify(substitution));

						relationship.attrib.Target = encodeURI(target);
					}
				);
			}
		});

		this.replaceChildren(rels, newRelationships);

		// @ts-ignore
		this.archive.file(relsFilename, element.tostring(rels));
	};

	// Perform substitution in table headers
	public substituteTableColumnHeaders = (tables: any, substitutions: any) => {
		tables.forEach((table: { root: any; }) => {
			const root = table.root;
			const columns = root.find('tableColumns');
			const autoFilter = root.find('autoFilter');
			const tableRange = this.splitRange(root.attrib.ref);
			let idx = 0;
			let inserted = 0;
			const newColumns: any[] | never[] = [];

			columns.findall('tableColumn').forEach((col: any) => {
				++idx;
				col.attrib.id = Number(idx).toString();
				// @ts-ignore
				newColumns.push(col);

				let name = col.attrib.name;

				this.extractPlaceholders(name).forEach((placeholder: any) => {
					const substitution = substitutions[placeholder.name];
					if (substitution === undefined) {
						return;
					}

					// Array -> new columns
					if (placeholder.full && placeholder.type === 'normal' && substitution instanceof Array) {
						substitution.forEach((elem: any, i: number) => {
							let newCol = col;
							if (i > 0) {
								newCol = this.cloneElement(newCol);
								newCol.attrib.id = Number(++idx).toString();
								// @ts-ignore
								newColumns.push(newCol);
								++inserted;
								tableRange.end = this.nextCol(tableRange.end);
							}
							newCol.attrib.name = this.stringify(elem);
						});
						// Normal placeholder
					} else {
						name = name.replace(placeholder.placeholder, this.stringify(substitution));
						col.attrib.name = name;
					}
				});
			});

			this.replaceChildren(columns, newColumns);

			// Update range if we inserted columns
			if (inserted > 0) {
				columns.attrib.count = Number(idx).toString();
				root.attrib.ref = this.joinRange(tableRange);
				if (autoFilter !== null) {
					// XXX: This is a simplification that may stomp on some configurations
					autoFilter.attrib.ref = this.joinRange(tableRange);
				}
			}

			// update ranges for totalsRowCount
			const tableRoot = table.root;
			const tableRanges = this.splitRange(tableRoot.attrib.ref);
			const tableStart = this.splitRef(tableRanges.start);
			const tableEnd = this.splitRef(tableRanges.end);

			if (tableRoot.attrib.totalsRowCount) {
				// tslint:disable-next-line:no-shadowed-variable
				const autoFilter = tableRoot.find('autoFilter');
				if (autoFilter !== null) {
					autoFilter.attrib.ref = this.joinRange({
						start: this.joinRef(tableStart),
						end: this.joinRef(tableEnd),
					});
				}

				++tableEnd.row;
				tableRoot.attrib.ref = this.joinRange({
					start: this.joinRef(tableStart),
					end: this.joinRef(tableEnd),
				});

			}
		});
	};

	// Return a list of tokens that may exist in the string.
	// Keys are: `placeholder` (the full placeholder, including the `${}`
	// delineators), `name` (the name part of the token), `key` (the object key
	// for `table` tokens), `full` (boolean indicating whether this placeholder
	// is the entirety of the string) and `type` (one of `table` or `cell`)
	public extractPlaceholders = (str: any) => {
		// Yes, that's right. It's a bunch of brackets and question marks and stuff.
		const re = /\${(?:(.+?):)?(.+?)(?:\.(.+?))?}/g;

		let match = null;
		const matches = [];
		// tslint:disable-next-line:no-conditional-assignment
		while ((match = re.exec(str)) !== null) {
			matches.push({
				placeholder: match[0],
				type: match[1] || 'normal',
				name: match[2],
				key: match[3],
				full: match[0].length === str.length
			});
		}

		return matches;
	};

	// Split a reference into an object with keys `row` and `col` and,
	// optionally, `table`, `rowAbsolute` and `colAbsolute`.
	public splitRef = (ref: any) => {
		const match = ref.match(/(?:(.+)!)?(\$)?([A-Z]+)(\$)?([0-9]+)/);
		return {
			table: match && match[1] || null,
			colAbsolute: Boolean(match && match[2]),
			col: match && match[3],
			rowAbsolute: Boolean(match && match[4]),
			row: parseInt(match && match[5], 10)
		};
	};

	// Join an object with keys `row` and `col` into a single reference string
	public joinRef = (ref: any) => (ref.table ? ref.table + '!' : '') +
		(ref.colAbsolute ? '$' : '') +
		ref.col.toUpperCase() +
		(ref.rowAbsolute ? '$' : '') +
		Number(ref.row).toString();

	// Get the next column's cell reference given a reference like "B2".
	public nextCol = (ref: any) => {
		ref = ref.toUpperCase();
		return ref.replace(/[A-Z]+/, (match: any) => this.numToChar(this.charToNum(match) + 1));
	};

	// Get the next row's cell reference given a reference like "B2".
	public nextRow = (ref: any) => {
		ref = ref.toUpperCase();
		return ref.replace(/[0-9]+/, (match: any) => (parseInt(match, 10) + 1).toString());
	};

	// Turn a reference like "AA" into a number like 27
	public charToNum = (str: any) => {
		let num = 0;
		for (let idx = str.length - 1, iteration = 0; idx >= 0; --idx, ++iteration) {
			const thisChar = str.charCodeAt(idx) - 64; // A -> 1; B -> 2; ... Z->26
			const multiplier = Math.pow(26, iteration);
			num += multiplier * thisChar;
		}
		return num;
	};

	// Turn a number like 27 into a reference like "AA"
	public numToChar = (num: any) => {
		let str = '';

		for (let i = 0; num > 0; ++i) {
			const remainder = num % 26;
			let charCode = remainder + 64;
			num = (num - remainder) / 26;

			// Compensate for the fact that we don't represent zero, e.g. A = 1, Z = 26, but AA = 27
			if (remainder === 0) { // 26 -> Z
				charCode = 90;
				--num;
			}

			str = String.fromCharCode(charCode) + str;
		}

		return str;
	};

	// Is ref a range?
	public isRange = (ref: any) => ref.indexOf(':') !== -1;

	// Is ref inside the table defined by startRef and endRef?
	public isWithin = (ref: any, startRef: any, endRef: any) => {
		const start = this.splitRef(startRef);
		const end = this.splitRef(endRef);
		const target = this.splitRef(ref);

		start.col = this.charToNum(start.col);
		end.col = this.charToNum(end.col);
		target.col = this.charToNum(target.col);

		return (
			start.row <= target.row && target.row <= end.row &&
			start.col <= target.col && target.col <= end.col
		);

	};

	// Turn a value of any type into a string
	public stringify = (value: any): string => {
		if (value instanceof Date) {
			// In Excel date is a number of days since 01/01/1900
			//           timestamp in ms    to days      + number of days from 1900 to 1970
			return Number((value.getTime() / (1000 * 60 * 60 * 24)) + 25569).toString();
		} else if (typeof (value) === 'number' || typeof (value) === 'boolean') {
			return Number(value).toString();
		} else if (typeof (value) === 'string') {
			return String(value).toString();
		}

		return '';
	};

	// Insert a substitution value into a cell (c tag)
	public insertCellValue = (cell: any, substitution: any) => {
		const cellValue = cell.find('v');
		const stringified = this.stringify(substitution);

		if (typeof substitution === 'string' && substitution[0] === '=') {
			// substitution, started with '=' is a formula substitution
			//  @ts-ignore
			const formula = new element.Element('f');
			formula.text = substitution.substr(1);
			cell.insert(1, formula);
			delete cell.attrib.t;  // cellValue will be deleted later
			return formula.text;
		}

		if (typeof (substitution) === 'number' || substitution instanceof Date) {
			delete cell.attrib.t;
			cellValue.text = stringified;
		} else if (typeof (substitution) === 'boolean') {
			cell.attrib.t = 'b';
			cellValue.text = stringified;
		} else {
			cell.attrib.t = 's';
			cellValue.text = Number(this.stringIndex(stringified)).toString();
		}

		return stringified;
	};

	// Perform substitution of a single value
	// tslint:disable-next-line:variable-name
	public substituteScalar = (cell: any, string: any, placeholder: any, substitution: any) => {
		if (placeholder.full) {
			return this.insertCellValue(cell, substitution);
		} else {
			const newString = string.replace(placeholder.placeholder, this.stringify(substitution));
			cell.attrib.t = 's';
			return this.insertCellValue(cell, newString);
		}

	};

	// Perform a columns substitution from an array
	public substituteArray = (cells: any, cell: any, substitution: any) => {
		let newCellsInserted = -1; // we technically delete one before we start adding back
		let currentCell = cell.attrib.r;

		// add a cell for each element in the list
		// tslint:disable-next-line:no-shadowed-variable
		substitution.forEach((element: any) => {
			++newCellsInserted;

			if (newCellsInserted > 0) {
				currentCell = this.nextCol(currentCell);
			}

			const newCell = this.cloneElement(cell);
			this.insertCellValue(newCell, element);

			newCell.attrib.r = currentCell;
			cells.push(newCell);
		});

		return newCellsInserted;
	};

	// Perform a table substitution. May update `newTableRows` and `cells` and change `cell`.
	// Returns total number of new cells inserted on the original row.
	public substituteTable = (row: any, newTableRows: any, cells: any, cell: any, namedTables: any, substitution: any, key: any) => {
		let newCellsInserted = 0; // on the original row

		// if no elements, blank the cell, but don't delete it
		if (substitution.length === 0) {
			delete cell.attrib.t;
			this.replaceChildren(cell, []);
		} else {

			const parentTables = namedTables.filter((namedTable: any) => {
				const range = this.splitRange(namedTable.root.attrib.ref);
				return this.isWithin(cell.attrib.r, range.start, range.end);
			});

			// tslint:disable-next-line:only-arrow-functions no-shadowed-variable
			substitution.forEach((element: any, idx: any) => {
				// tslint:disable-next-line:unified-signatures
				let newRow: { attrib: { r: any; }; append: { (arg0: any): void; (arg0: { attrib: { r: any; }; }): void; }; };
				let newCell: { attrib: { r: any; }; };
				let newCellsInsertedOnNewRow = 0;
				const newCells: never[] = [];
				const value = _get(element, key, '');

				if (idx === 0) { // insert in the row where the placeholders are

					if (value instanceof Array) {
						newCellsInserted = this.substituteArray(cells, cell, value);
					} else {
						this.insertCellValue(cell, value);
					}

				} else { // insert new rows (or reuse rows just inserted)

					// Do we have an existing row to use? If not, create one.
					if ((idx - 1) < newTableRows.length) {
						newRow = newTableRows[idx - 1];
					} else {
						newRow = this.cloneElement(row, false);
						newRow.attrib.r = this.getCurrentRow(row, newTableRows.length + 1);
						newTableRows.push(newRow);
					}

					// Create a new cell
					newCell = this.cloneElement(cell);
					newCell.attrib.r = this.joinRef({
						row: newRow.attrib.r,
						col: this.splitRef(newCell.attrib.r).col
					});

					if (value instanceof Array) {
						newCellsInsertedOnNewRow = this.substituteArray(newCells, newCell, value);

						// Add each of the new cells created by substituteArray()
						// tslint:disable-next-line:no-shadowed-variable
						newCells.forEach((newCell: any) => {
							newRow.append(newCell);
						});

						this.updateRowSpan(newRow, newCellsInsertedOnNewRow);
					} else {
						this.insertCellValue(newCell, value);

						// Add the cell that previously held the placeholder
						newRow.append(newCell);
					}

					// expand named table range if necessary
					parentTables.forEach((namedTable: any) => {
						const tableRoot = namedTable.root;
						const autoFilter = tableRoot.find('autoFilter');
						const range = this.splitRange(tableRoot.attrib.ref);

						if (!this.isWithin(newCell.attrib.r, range.start, range.end)) {
							range.end = this.nextRow(range.end);
							tableRoot.attrib.ref = this.joinRange(range);
							if (autoFilter !== null) {
								// XXX: This is a simplification that may stomp on some configurations
								autoFilter.attrib.ref = tableRoot.attrib.ref;
							}
						}
					});
				}
			});
		}

		return newCellsInserted;
	};

	// Clone an element. If `deep` is true, recursively clone children
	// tslint:disable-next-line:no-shadowed-variable
	public cloneElement = (element: any, deep?: any) => {
		const newElement = element.Element(element.tag, element.attrib);
		newElement.text = element.text;
		newElement.tail = element.tail;

		if (deep !== false) {
			element.getchildren().forEach((child: any) => {
				newElement.append(this.cloneElement(child, deep));
			});
		}

		return newElement;
	};

	// Replace all children of `parent` with the nodes in the list `children`
	public replaceChildren = (parent: any, children: any) => {
		parent.delSlice(0, parent.len());
		children.forEach((child: any) => {
			parent.append(child);
		});
	};

	// Calculate the current row based on a source row and a number of new rows
	// that have been inserted above
	public getCurrentRow = (row: any, rowsInserted: any) => parseInt(row.attrib.r, 10) + rowsInserted;

	// Calculate the current cell based on asource cell, the current row index,
	// and a number of new cells that have been inserted so far
	public getCurrentCell = (cell: any, currentRow: any, cellsInserted: any) => {

		const colRef = this.splitRef(cell.attrib.r).col;
		const colNum = this.charToNum(colRef);

		return this.joinRef({
			row: currentRow,
			col: this.numToChar(colNum + cellsInserted)
		});
	};

	// Adjust the row `spans` attribute by `cellsInserted`
	public updateRowSpan = (row: any, cellsInserted: any) => {
		if (cellsInserted !== 0 && row.attrib.spans) {
			const rowSpan = row.attrib.spans.split(':').map((f: string) => parseInt(f, 10));
			rowSpan[1] += cellsInserted;
			row.attrib.spans = rowSpan.join(':');
		}
	};

	// Split a range like "A1:B1" into {start: "A1", end: "B1"}
	public splitRange = (range: { split: (arg0: string) => void; }) => {
		const split = range.split(':');
		return {
			start: split[0],
			end: split[1]
		};
	};

	// Join into a a range like "A1:B1" an object like {start: "A1", end: "B1"}
	public joinRange = (range: any) => range.start + ':' + range.end;

	// Look for any merged cell or named range definitions to the right of
	// `currentCell` and push right by `numCols`.
	public pushRight = (workbook: any, sheet: any, currentCell: any, numCols: any) => {
		const cellRef = this.splitRef(currentCell);
		const currentRow = cellRef.row;
		const currentCol = this.charToNum(cellRef.col);

		// Update merged cells on the same row, at a higher column
		sheet.findall('mergeCells/mergeCell').forEach((mergeCell: any) => {
			const mergeRange = this.splitRange(mergeCell.attrib.ref);
			const mergeStart = this.splitRef(mergeRange.start);
			const mergeStartCol = this.charToNum(mergeStart.col);
			const mergeEnd = this.splitRef(mergeRange.end);
			const mergeEndCol = this.charToNum(mergeEnd.col);

			if (mergeStart.row === currentRow && currentCol < mergeStartCol) {
				mergeStart.col = this.numToChar(mergeStartCol + numCols);
				mergeEnd.col = this.numToChar(mergeEndCol + numCols);

				mergeCell.attrib.ref = this.joinRange({
					start: this.joinRef(mergeStart),
					end: this.joinRef(mergeEnd),
				});
			}
		});

		// Named cells/ranges
		workbook.findall('definedNames/definedName').forEach((name: any) => {
			const ref = name.text;

			if (this.isRange(ref)) {
				const namedRange = this.splitRange(ref);
				const namedStart = this.splitRef(namedRange.start);
				const namedStartCol = this.charToNum(namedStart.col);
				const namedEnd = this.splitRef(namedRange.end);
				const namedEndCol = this.charToNum(namedEnd.col);

				if (namedStart.row === currentRow && currentCol < namedStartCol) {
					namedStart.col = this.numToChar(namedStartCol + numCols);
					namedEnd.col = this.numToChar(namedEndCol + numCols);

					name.text = this.joinRange({
						start: this.joinRef(namedStart),
						end: this.joinRef(namedEnd),
					});
				}
			} else {
				const namedRef = this.splitRef(ref);
				const namedCol = this.charToNum(namedRef.col);

				if (namedRef.row === currentRow && currentCol < namedCol) {
					namedRef.col = this.numToChar(namedCol + numCols);

					name.text = this.joinRef(namedRef);
				}
			}

		});
	};

	// Look for any merged cell, named table or named range definitions below
	// `currentRow` and push down by `numRows` (used when rows are inserted).
	public pushDown = (workbook: any, sheet: any, tables: any, currentRow: any, numRows: any) => {
		const mergeCells = sheet.find('mergeCells');

		// Update merged cells below this row
		sheet.findall('mergeCells/mergeCell').forEach((mergeCell: any) => {
			const mergeRange = this.splitRange(mergeCell.attrib.ref);
			const mergeStart = this.splitRef(mergeRange.start);
			const mergeEnd = this.splitRef(mergeRange.end);

			if (mergeStart.row > currentRow) {
				mergeStart.row += numRows;
				mergeEnd.row += numRows;

				mergeCell.attrib.ref = this.joinRange({
					start: this.joinRef(mergeStart),
					end: this.joinRef(mergeEnd),
				});

			}

			// add new merge cell
			if (mergeStart.row === currentRow) {
				for (let i = 1; i <= numRows; i++) {
					const newMergeCell = this.cloneElement(mergeCell);
					mergeStart.row += 1;
					mergeEnd.row += 1;
					newMergeCell.attrib.ref = this.joinRange({
						start: this.joinRef(mergeStart),
						end: this.joinRef(mergeEnd)
					});
					mergeCells.attrib.count += 1;
					mergeCells._children.push(newMergeCell);
				}
			}
		});

		// Update named tables below this row
		tables.forEach((table: any) => {
			const tableRoot = table.root;
			const tableRange = this.splitRange(tableRoot.attrib.ref);
			const tableStart = this.splitRef(tableRange.start);
			const tableEnd = this.splitRef(tableRange.end);

			if (tableStart.row > currentRow) {
				tableStart.row += numRows;
				tableEnd.row += numRows;

				tableRoot.attrib.ref = this.joinRange({
					start: this.joinRef(tableStart),
					end: this.joinRef(tableEnd),
				});

				const autoFilter = tableRoot.find('autoFilter');
				if (autoFilter !== null) {
					// XXX: This is a simplification that may stomp on some configurations
					autoFilter.attrib.ref = tableRoot.attrib.ref;
				}
			}
		});

		// Named cells/ranges
		workbook.findall('definedNames/definedName').forEach((name: any) => {
			const ref = name.text;

			if (this.isRange(ref)) {
				const namedRange = this.splitRange(ref);
				const namedStart = this.splitRef(namedRange.start);
				const namedEnd = this.splitRef(namedRange.end);

				if (namedStart) {
					if (namedStart.row > currentRow) {
						namedStart.row += numRows;
						namedEnd.row += numRows;

						name.text = this.joinRange({
							start: this.joinRef(namedStart),
							end: this.joinRef(namedEnd),
						});

					}
				}
			} else {
				const namedRef = this.splitRef(ref);

				if (namedRef.row > currentRow) {
					namedRef.row += numRows;
					name.text = this.joinRef(namedRef);
				}
			}

		});
	};
}