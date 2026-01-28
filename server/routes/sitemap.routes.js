import express from 'express';
import DoctorService from '../models/DoctorService.js';
import Medicine from '../models/Medicine.js';
import LaboratoryTest from '../models/LaboratoryTest.js';

const router = express.Router();

/**
 * @route   GET /api/sitemap.xml
 * @desc    Generate dynamic XML sitemap with all service URLs
 * @access  Public
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://sehatkor.pk';
    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch all services from all provider types
    const [doctorServices, medicines, labTests] = await Promise.all([
      DoctorService.find({}).select('_id updatedAt').lean(),
      Medicine.find({}).select('_id updatedAt').lean(),
      LaboratoryTest.find({}).select('_id updatedAt').lean()
    ]);

    // Collect all service URLs
    const serviceUrls = [];

    // Add doctor services
    doctorServices.forEach(service => {
      if (service._id) {
        serviceUrls.push({
          loc: `${baseUrl}/service/${service._id}`,
          lastmod: service.updatedAt 
            ? new Date(service.updatedAt).toISOString().split('T')[0] 
            : currentDate,
          changefreq: 'weekly',
          priority: '0.8'
        });
      }
    });

    // Add medicines
    medicines.forEach(service => {
      if (service._id) {
        serviceUrls.push({
          loc: `${baseUrl}/service/${service._id}`,
          lastmod: service.updatedAt 
            ? new Date(service.updatedAt).toISOString().split('T')[0] 
            : currentDate,
          changefreq: 'weekly',
          priority: '0.8'
        });
      }
    });

    // Add lab tests
    labTests.forEach(service => {
      if (service._id) {
        serviceUrls.push({
          loc: `${baseUrl}/service/${service._id}`,
          lastmod: service.updatedAt 
            ? new Date(service.updatedAt).toISOString().split('T')[0] 
            : currentDate,
          changefreq: 'weekly',
          priority: '0.8'
        });
      }
    });

    // Static pages
    const staticPages = [
      { loc: `${baseUrl}/`, lastmod: currentDate, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/doctors`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/pharmacies`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/labs`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/hospitals`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/about`, lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
      { loc: `${baseUrl}/contact`, lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
      { loc: `${baseUrl}/blog`, lastmod: currentDate, changefreq: 'weekly', priority: '0.7' }
    ];

    // Combine all URLs
    const allUrls = [...staticPages, ...serviceUrls];

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    allUrls.forEach(url => {
      xml += '  <url>\n';
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // Set headers for XML response
    res.header('Content-Type', 'application/xml');
    res.send(xml);

    console.log(`✅ Sitemap generated with ${allUrls.length} URLs (${serviceUrls.length} services + ${staticPages.length} static pages)`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * @route   GET /api/sitemap/stats
 * @desc    Get sitemap statistics (for debugging)
 * @access  Public
 */
router.get('/sitemap/stats', async (req, res) => {
  try {
    const [doctorCount, medicineCount, labTestCount] = await Promise.all([
      DoctorService.countDocuments({}),
      Medicine.countDocuments({}),
      LaboratoryTest.countDocuments({})
    ]);

    const totalServices = doctorCount + medicineCount + labTestCount;

    res.json({
      services: {
        doctorServices: doctorCount,
        medicines: medicineCount,
        labTests: labTestCount,
        total: totalServices
      },
      sitemapUrls: {
        staticPages: 8,
        servicePages: totalServices,
        total: 8 + totalServices
      }
    });
  } catch (error) {
    console.error('Error getting sitemap stats:', error);
    res.status(500).json({ error: 'Failed to get sitemap stats' });
  }
});

export default router;
