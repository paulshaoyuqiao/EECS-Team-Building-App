import pymongo
import json
import os

MONGO_CLUSTER = os.path.join(os.path.dirname(__file__), 'cluster_info.json')


class Database(object):
    """
    A simple wrapper around access to Mongo Database. Access to specific
    collections are abstracted through a singleton object to avoid repetitive
    setups and additional overheads from reconnecting with Pymongo Driver.

    Please do not directly import this class. Utilize the singleton object
    constructed at the bottom of this file.
    """
    with open(MONGO_CLUSTER) as f:
        cluster_info = json.load(f)
        _db_client = cluster_info['cluster-string']

    _inst = None

    def __new__(cls):
        if cls._inst is None:
            cls._inst = super().__new__(cls)
            cls.client = pymongo.MongoClient(cls._db_client)
        return cls._inst

    @property
    def users(self):
        return self.client.users

    @property
    def rosters(self):
        return self.client.rosters

    @property
    def templates(self):
        return self.client.templates


db = Database()
