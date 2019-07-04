import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
		console.log('Congratulations, your extension "jumper" is now active!');

	// let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
	// 	vscode.window.showInformationMessage('Hello World!');
	// });

	// context.subscriptions.push(disposable);

	findFile( `c:\Users\estivo\Desktop\extTest\jumper_tests\test.lua`, `test2.lua` );

	vscode.languages.registerDefinitionProvider('*',{
		provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
			let wordRange = document.getWordRangeAtPosition( position );
			let text = "";
			if (wordRange !== undefined)
			{
				text = document.getText( wordRange );

				let np = wordRange.start;
				//check left
				while( isValidPath(text) )
				{
						np = np.translate(0,-1);
						wordRange = new vscode.Range(np, wordRange.end);
						text = document.getText( wordRange );
				}
				
				np = np.translate( 0, 1 );
				wordRange = new vscode.Range(np, wordRange.end);
				text = document.getText( wordRange );

				np = wordRange.end;

				//check right
				while( isValidPath(text) )
				{
					np = np.translate(0,1);
					wordRange = new vscode.Range( wordRange.start, np );
					text = document.getText( wordRange );
				}

				np = np.translate( 0, -1 );
				wordRange = new vscode.Range( wordRange.start, np );
				text = document.getText( wordRange );
			}

			if( isValidFile( text ) )
			{
				let path = document.fileName;
				let newFile = findFile( path, text );
				return new vscode.Location( vscode.Uri.file(newFile), new vscode.Position(0, 0) );
			}

			return [];
		}
	});
}

function isValidPath( path : string ) : boolean
{
	let regex = RegExp(`['<>:"|?*\0]`);
	return !regex.test(path);
}

function isValidFile( path : string ) : boolean
{
	let regex = RegExp('\/?([A-z0-9-_+]+\/)*([A-z0-9]+\.)([A-z0-9]+)');
	return regex.test(path);
}
// test2.lua
//"c:\Users\estivo\Desktop\extTest\jumper_tests\test.lua"
function findFile( path : string, target : string ) : string
{
	let ret : string = "";

	let res = target.split( '\\', 255 );
	let pathArray = path.split('\\', 255);

	var i = 0;
	for( i = 0; i < pathArray.length - res.length; i ++ )
	{
		ret += pathArray[i] + "/";
	}

	for( i = 0; i < res.length-1; i++ )
	{
		ret += res[i] + "/";
	}

	ret += res[i];

	return ret;
}

export function deactivate() {}
