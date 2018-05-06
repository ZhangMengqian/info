#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at

#        http://www.apache.org/licenses/LICENSE-2.0

#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.
from __future__ import print_function
import MySQLdb
# import base64
import json
import sys
class account:
	def _init_(self,sha_value,ac_id,ac_short_name,status,term_date,inception_date,ac_region,ac_sub_region,cod_country_domicile,liq_method,contracting_entity,mgn_entity,ac_legal_name,manager_name,cod_ccy_base,longname,mandate_id,client_id,custodian_name,sub_mandate_id,transfer_agent_name,trust_bank,re_trust_bank,last_updated_by,last_approved_by,last_update_date):
		self.sha_value = sha_value
		self.ac_id = ac_id
		self.ac_short_name = ac_short_name
		self.status = status
		self.term_date = term_date
		self.inception_date = inception_date
		self.ac_region = ac_region
		self.ac_sub_region = ac_sub_region
		self.cod_country_domicile = cod_country_domicile
		self.liq_method = liq_method
		self.contracting_entity = contracting_entity
		self.mgn_entity = mgn_entity
		self.ac_legal_name = ac_legal_name
		self.manager_name = manager_name
		self.cod_ccy_base = cod_ccy_base
		self.longname = longname
		self.mandate_id = mandate_id
		self.client_id = client_id
		self.custodian_name = custodian_name
		self.sub_mandate_id = sub_mandate_id
		self.transfer_agent_name = transfer_agent_name
		self.trust_bank = trust_bank
		self.re_trust_bank = re_trust_bank
		self.last_updated_by = last_updated_by
		self.last_approved_by = last_approved_by
		self.last_update_date = last_update_date

def get_data(cursor,table_name):
	sql = "SELECT * FROM %s WHERE ac_id = %s" % (table_name,  value)
	res =[]
	result = []
	#print (sql)
	try:
		cursor.execute(sql)
		results = cursor.fetchall()
		for row in results:
			print(row)
			if table_name =='account':
				data = {'sha_value': row[0], 'ac_id': row[1], 'ac_short_name': row[2], 'status': row[3],
					'term_date': row[4], 'inception_date': row[5], 'ac_region': row[6], 'ac_sub_region': row[7],
					'cod_country_domicile': row[8], 'liq_method': row[9], 'contracting_entity': row[10],
					'mgn_entity': row[11], 'ac_legal_name': row[12], 'manager_name': row[13], 'cod_ccy_base': row[14],
					'longname': row[15], 'mandate_id': row[16], 'client_id': row[17], 'custodian_name': row[18],
					'sub_mandate_id': row[19], 'transfer_agent_name': row[20], 'trust_bank': row[21],
					're_trust_bank': row[22], 'last_updated_by': row[23], 'last_approved_by': row[24],
					'last_update_date': row[25]}
			elif table_name =='ac_benchmark':
				data = {'sha_value': row[0], 'ac_id': row[1], 'benchmark_id': row[2], 'source': row[3],
					'name': row[4], 'currency': row[5], 'primary_flag': row[6], 'start_date': row[7],
						'end_date': row[8], 'benchmark_reference_id': row[9], 'benchmark_reference_id_source': row[10],}
			elif table_name =='ac_trade':
				data = {'sha_value': row[0], 'ac_id': row[1], 'lvts': row[2], 'calypso': row[3],
						'aladdin': row[4], 'trade_start_date': row[5], 'equity': row[6], 'fixed_income': row[7],}
			elif table_name =='benchmarks':
				data = {'sha_value': row[0], 'benchmark_id': row[1], 'id_source': row[2], 'name': row[3],
						'currency': row[4], 'benchmark_reference_id': row[5], 'benchmark_reference_id_source': row[6]}
			print (data)
			res.append(data)
	except:
		print("Error: unable to fecth data")
	for i in range (0,len(res)):
		tmp = json.dumps(res[i])
		result.append(tmp)
	return result

# Usage:
# * python test.py ac_id
# http://www.runoob.com/python/python-mysql.html
if __name__ == '__main__':
	table_name = ['account', 'ac_trade', 'ac_benchmark', 'benchmarks']
	connection = MySQLdb.connect(
		host='localhost',
		user='root',
		passwd='',
		port=3306,
		db='morgan'
	)
	cursor = connection.cursor()
	value = sys.argv[1]

	get_data(cursor,table_name[0])
	# sql = "SELECT * FROM %s WHERE ac_id = %s" % (i,  value)
	# #print (sql)
	# try:
	# 	cursor.execute(sql)
	# 	results = cursor.fetchall()
	# 	for row in results:
	# 		print(row)
	# except:
	# 	print("Error: unable to fecth data")
	connection.close()