const adminHelpers = require("../helpers/admin-helpers");
const productHelpers=require("../helpers/product-helpers")
const categoryHelpers=require("../helpers/category-helper")
const BrandHelpers=require("../helpers/Brandhelpers")
const db=require('../config/connection')
const collection=require('../config/collection');


module.exports={
    dashboardrender:(req,res,next)=>{
        if(req.session.adminloggedIn){
            res.render('admin/dashboard',{layout:"adminlayout"})
        }else{
            res.redirect('/admin/adminlogin')
        }
    },
    renderuserview:(req,res)=>{
        if(req.session.adminloggedIn){
            adminHelpers.getuserdata().then((users)=>{
            res.render('admin/user-view',{layout:"adminlayout",users})
        }) 
        }else{
           res.redirect('/admin/adminlogin') 
        }
    },
    blockuser:async(req,res)=>{
        try{
        let userId=req.params.id
        console.log(userId);
        await adminHelpers.changeuserstatus(userId)
        res.redirect('/admin/user-view')
    }catch(err){
        console.log(err);
    }

    },
    renderadminlogin:(req,res)=>{
        if(req.session.adminloggedIn){
        res.redirect('/admin')
        }else{ 
        res.render('admin/adminlogin',{layout:"adminlayout",adminlogin:true,adminlogErr:req.session.admlogErr})
        req.session.admlogErr=false;
        }
    },
    postadminlogin:async(req,res)=>{
        let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:req.body.email});
        console.log(admin);
    if(admin){
        if(admin.password==req.body.password&&admin.email==req.body.email){
        req.session.admin = req.body.email;
        req.session.adminloggedIn = true;
        res.redirect('/admin')
        }else{
        req.session.admlogErr = "password not match....";
        console.log(req.session.admlogErr);
        res.redirect('/admin/adminlogin')
        }
    }else{
        req.session.admlogErr = "Invalid username or password";
        res.redirect('/admin/adminlogin')
    }
    },
    adminlogout:(req,res)=>{
        req.session.adminloggedIn =false;
        res.redirect('/admin/adminlogin')
    },
    renderproductview:(req,res)=>{
        productHelpers.findproducts().then((products)=>{
        console.log("koiiiiiiiiiiiii");
        console.log(products);
        res.render('admin/product-view',{layout:"adminlayout",products})
        })
    },
    renderaddproduct:async(req,res)=>{
        let branddata= await BrandHelpers.findbranddate()
        categoryHelpers.findcategory().then((category)=>{
        console.log(category);
        res.render('admin/add-product',{layout:"adminlayout",category,branddata})
        })
    },
    postaddproduct:(req,res)=>{
        console.log(req.body);
        console.log('hiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
        console.log(req.files);
        let images=req.files
        productHelpers.productdata(req.body,images).then((response)=>{
        console.log(response);
        })
        res.redirect("/admin/add-product")   
    },
    rendercategory:(req,res)=>{
        categoryHelpers.findcategory().then((category)=>{
        res.render('admin/category-list',{layout:"adminlayout",category})  
        })
    },
    renderaddcategory:(req,res)=>{
        res.render('admin/add-category',{layout:"adminlayout"})
    },
    postaddcategory:(req,res)=>{
       categoryHelpers.getcategorydata(req.body).then((response)=>{
       console.log(response);
       })
        res.redirect('/admin/addcategory')
    },
    renderbrandlist:async(req,res)=>{
        let brands= await BrandHelpers.findbranddate()
        res.render('admin/brand-list',{layout:"adminlayout",brands})
    },
    postbrandlist:async (req,res)=>{
       await BrandHelpers.addbranddata(req.body)
       res.redirect('/admin/Brand')
    },
    unlistcategory:async(req,res)=>{
        try{
            let categoryId=req.params.id
            console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
            console.log(categoryId);
            await categoryHelpers.deletecategory(categoryId)
            res.redirect('/admin/category')
        }catch(err){
            console.log(err);
        }
    },
    editproduct:async(req,res)=>{
        const productId=req.params.id
        let [products, categories, brands] = await Promise.all([
            productHelpers.findsingleproductdata(productId),
            categoryHelpers.findAll(),
            BrandHelpers.findbranddate()
          ])
    
        res.render('admin/edit-product',{layout:"adminlayout"})
    }

}
