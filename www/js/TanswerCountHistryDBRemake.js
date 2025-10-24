//TAnswerCountHistryのtable作り直し
var TAnswerCountHistryDBRemake =
{
	init:function(){
		TAnswerCountHistryDBRemake.data = {};
		TAnswerCountHistryDBRemake.dbremake = false;
	},
	getalldata:function(tx)
	{	
		console.log('getalldata ');
        tx.executeSql('SELECT *  FROM ' +  setting.TAnswerCountHistry + ' ',[],function (tx, results2) {
        	console.log(results2);
		      if (useSqlite) {
		          TAnswerCountHistryDBRemake.data.results  = results2.rows;
		      }else{
		          TAnswerCountHistryDBRemake.data.results = results2.rows;
		      }
        });
 	},
	droptable:function(tx)
	{
		if(!TAnswerCountHistryDBRemake.dbremake)return false;
		console.log('drop table');
        tx.executeSql('DROP TABLE  ' + setting.TAnswerCountHistry,[],function (tx, results3) {

        });
	},
	createtable:function(tx){
		if(!TAnswerCountHistryDBRemake.dbremake)return false;
		console.log('create table');
		tx.executeSql('CREATE TABLE  ' +  setting.TAnswerCountHistry + '_copy(' + setting.TAnswerCountHistryInsertQuery + ')',[],function (tx, results) {
		});	
	},
	setdata:function(tx)
	{
		if(!TAnswerCountHistryDBRemake.dbremake)return false;
	      if(TAnswerCountHistryDBRemake.data.results)
	      {
		      if (useSqlite) {
		          var tmpRow  = TAnswerCountHistryDBRemake.data.results;
		      }else{
		          var tmpRow = TAnswerCountHistryDBRemake.data.results;
		      }
		      for (var i = 0; i < tmpRow.length ; i++)
		      {
		        var tmpinsert = Object.values(tmpRow[i]);
		        var query = 'insert or ignore into ' + setting.TAnswerCountHistry+'_copy'
		            + ' ' + 'values (?, ?, ?)';
		        tx.executeSql(query,
		            [tmpinsert[0], "quiz",tmpinsert[1]],function(a){console.log(a)},function(e,b){console.log(e,b)});

		      }
		    TAnswerCountHistryDBRemake.droptable(tx);
			var query = 'ALTER TABLE ' + setting.TAnswerCountHistry+'_copy'
			    + ' ' + ' RENAME TO '+setting.TAnswerCountHistry+'';
			tx.executeSql(query);
	      }
	}
}
TAnswerCountHistryDBRemake.init();
/*
all
sub all
quiz
*/

