//TAnswerHistryのtable作り直し
var TAnswerHistryDBRemake =
{
	init:function(){
		TAnswerHistryDBRemake.data = {};
		TAnswerHistryDBRemake.dbremake = false;
	},
	getalldata:function(tx)
	{	
		console.log('getalldata ');
        tx.executeSql('SELECT *  FROM ' +  setting.TAnswerHistry + ' ',[],function (tx, results2) {
        	console.log(results2);
		      if (useSqlite) {
		          TAnswerHistryDBRemake.data.results  = results2.rows;
		      }else{
		          TAnswerHistryDBRemake.data.results = results2.rows;
		      }
        });
 	},
	droptable:function(tx)
	{
		if(!TAnswerHistryDBRemake.dbremake)return false;
		console.log('drop table');
        tx.executeSql('DROP TABLE  ' + setting.TAnswerHistry,[],function (tx, results3) {

        });
	},
	createtable:function(tx){
		if(!TAnswerHistryDBRemake.dbremake)return false;
		console.log('create table');
		tx.executeSql('CREATE TABLE  ' +  setting.TAnswerHistry + '_copy(' + setting.TAnswerHistryCreateQuery + ')',[],function (tx, results) {
	        tx.executeSql('SELECT sql  FROM sqlite_master where tbl_name="' +  setting.TAnswerHistry + '_copy"  AND type = "table" ',[],function (tx, results) {
	          if( results.rows[0].sql.match(/answer_1_date/) === null ){
	            for (var i = 0; i < setting.AddTAnswerHistryCreateQuery.length ; i++) {
	              tx.executeSql('ALTER TABLE '+ setting.TAnswerHistry +'_copy ADD  ' +  setting.AddTAnswerHistryCreateQuery[i] + ' ');
	            }              
	          }
	        });
		});	
	},
	setdata:function(tx)
	{
		if(!TAnswerHistryDBRemake.dbremake)return false;
	      if(TAnswerHistryDBRemake.data.results)
	      {
		      if (useSqlite) {
		          var tmpRow  = TAnswerHistryDBRemake.data.results;
		      }else{
		          var tmpRow = TAnswerHistryDBRemake.data.results;
		      }
		      for (var i = 0; i < tmpRow.length ; i++)
		      {
		        var tmpinsert = Object.values(tmpRow[i]);
		        var query = 'insert or ignore into ' + setting.TAnswerHistry+'_copy'
		            + ' ' + 'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
		        tx.executeSql(query,
		            [tmpinsert[0], "quiz",tmpinsert[1], tmpinsert[2], tmpinsert[3], tmpinsert[4], tmpinsert[5], tmpinsert[6], tmpinsert[7], tmpinsert[8], tmpinsert[9], tmpinsert[10], tmpinsert[11], tmpinsert[12], tmpinsert[13], tmpinsert[14]],function(a){console.log(a)},function(e,b){console.log(e,b)});

		      }
		    TAnswerHistryDBRemake.droptable(tx);
			var query = 'ALTER TABLE ' + setting.TAnswerHistry+'_copy'
			    + ' ' + ' RENAME TO '+setting.TAnswerHistry+'';
			tx.executeSql(query);
	      }
	}
}
TAnswerHistryDBRemake.init();
/*
all
sub all
quiz
*/

