import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	vscode.languages.registerDefinitionProvider('*',{
		provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
			let wordRange = document.getWordRangeAtPosition( position );
			let text = "";
			if( wordRange !== undefined )
			{
				text = document.getText( wordRange );

				let np = wordRange.start;
				//check left
				while( isValidPath( text ) )
				{
					np = np.translate( 0, -1 );
					wordRange = new vscode.Range(np, wordRange.end);
					text = document.getText( wordRange );
				}
				
				np = np.translate( 0, 1 );
				wordRange = new vscode.Range(np, wordRange.end);
				text = document.getText( wordRange );

				np = wordRange.end;

				//check right
				while( isValidPath( text ) )
				{
					np = np.translate( 0, 1 );
					wordRange = new vscode.Range( wordRange.start, np );
					text = document.getText( wordRange );
				}

				np = np.translate( 0, -1 );
				wordRange = new vscode.Range( wordRange.start, np );
				text = document.getText( wordRange );
			}

			let wsFolders = vscode.workspace.workspaceFolders;
			if( isValidFile( text ) && wsFolders !== undefined )
			{
				if( wsFolders !== undefined )
				{
					let occurances : vscode.Location[] = [];
					wsFolders.forEach( element => {
						let filePath = element.uri.fsPath + "\\" + text;
						if( fs.existsSync( filePath ) ) 
						{
							occurances.push( 
								new vscode.Location( vscode.Uri.file( filePath ), new vscode.Position( 0, 0 ) )
							);
						}
					} );
					return occurances;
				}
			}
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

export function deactivate() {}
