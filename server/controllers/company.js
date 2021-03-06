import Sequelize from 'sequelize';
import db from '../models';

const { Company, Product, Certificate } = db;
const { Op } = Sequelize;

export default {
  registerCompany(req, res) {
    const {
      name, address, email, phoneNo, siteAddress, contactPerson
    } = req.body;
    Company.findOne({
      where: {
        name
      }
    })
      .then((companyFound) => {
        if (companyFound) {
          return res.status(409).json({
            status: 409,
            error: 'Company already registered'
          });
        }
        return Company.create({
          name,
          address,
          email,
          phoneNo,
          siteAddress,
          contactPerson
        }).then(newCompany => res.status(201).json({
          status: 200,
          message: `You have successfully registered ${name}`,
          company: newCompany
        })).catch(error => res.status(500).json({
          error: error.message
        }));
      });
  },
  getAllCompanies(req, res) {
    const limitValue = req.query.limit || 20;
    const pageValue = (req.query.page - 1) || 0;
    const sort = req.query.sort ? req.query.sort : 'createdAt';
    const { search } = req.query;

    if (search) {
      const searchQuery = search.split(' ');

      const name = searchQuery.map(value => ({
        name: { [Op.iLike]: `%${value}%` }
      }));

      const email = searchQuery.map(value => ({
        email: { [Op.iLike]: `%${value}%` }
      }));

      Company.findAndCountAll({
        order: [sort],
        where: {
          [Op.or]: name.concat(email)
        }
      }).then((allCompany) => {
        if (allCompany.length < 1) {
          return res.status(200).json({
            message: 'Sorry no company matched your search'
          });
        }
        return res.status(200).json({
          page: (pageValue + 1),
          totalCount: allCompany.count,
          pageCount: Math.ceil(allCompany.count / limitValue),
          pageSize: parseInt(allCompany.rows.length, 10),
          Companies: allCompany.rows
        });
      });
    } else {
      Company.findAndCountAll({
        order: [sort],
      }).then(allCompany => res.status(200).json({
        page: (pageValue + 1),
        totalCount: allCompany.count,
        pageCount: Math.ceil(allCompany.count / limitValue),
        pageSize: parseInt(allCompany.rows.length, 10),
        Companies: allCompany.rows
      }));
    }
  },
  getSingleCompany(req, res) {
    Company.findOne({
      where: {
        id: req.params.companyId
      },
      include: [
        { model: Product },
        { model: Certificate }
      ]
    }).then(singleCompany => res.status(200).json({
      companyDetail: singleCompany
    })).catch(error => res.status(500).json({
      error: error.message
    }));
  },
  updateCompany(req, res) {
    const {
      name, address, email, phoneNo, siteAddress, contactPerson
    } = req.body;

    Company.find({
      where: {
        id: req.params.companyId
      }
    }).then((companyFound) => {
      if (!companyFound) {
        return res.status(404).json({
          error: 'Company not registered'
        });
      }

      return companyFound.update({
        name: name || companyFound.name,
        email: email || companyFound.email,
        address: address || companyFound.address,
        phoneNo: phoneNo || companyFound.phoneNo,
        siteAddress: siteAddress || companyFound.siteAddress,
        contactPerson: contactPerson || companyFound.contactPerson
      }).then(updatedCompany => res.status(200).json({
        updatedCompany
      }));
    }).catch(error => res.status(500).json({
      error: error.message
    }));
  },
  deleteCompany(req, res) {
    Company.findOne({
      where: {
        id: req.params.companyId
      }
    }).then((companyFound) => {
      if (!companyFound) {
        return res.status(404).json({
          error: 'Company not registered'
        });
      }
      return companyFound.destroy(companyFound)
        .then(() => res.status(200).json({
          message: 'Company successfully removed'
        }));
    })
      .catch(error => res.status(500).json({
        error: error.message
      }));
  }
};
