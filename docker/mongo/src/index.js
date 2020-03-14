const http = require('http');
const url = require('url');
const {importBackup, exportBackup} = require('./backupBD');

/**
 * Метод для экспорта и импорта данных в бд.
 *
 * примеры вызова
 * http://localhost:8080/import?name=footballs
 * http://localhost:8080/export?name=configs
 */
http.createServer(async (req, res) => {
	let uri = url.parse(req.url, true);
	if (uri.pathname === '/export') {
		await exportBD(res, uri.query);
	} else if (uri.pathname === '/import') {
		await importBD(res, uri.query);
	}
}).listen(9090);

async function exportBD(res, query) {
	let stream = null;
	try {
		stream = await exportBackup(query.name);
	} catch (e) {
		console.log(`Error import ${query.name}`, e);
	}
	if (stream != null) {
		res.write(stream);
	}
	res.end();
}

async function importBD(res, query) {
	try {
		let stream = await importBackup(query.name);
	} catch (e) {
		console.log(`Error import ${query.name}`, e);
	}
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end();
}